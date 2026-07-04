if (!customElements.get('eh-infinite-scroll')) {
  customElements.define(
    'eh-infinite-scroll',
    class EhInfiniteScroll extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.sectionId;
        this.containerSelector = this.dataset.container;
        this.itemSelector = this.dataset.item || '.grid__item';
        this.nextUrl = this.dataset.nextUrl || null;
        this.currentPage = parseInt(this.dataset.currentPage, 10) || 1;
        this.autoLeft = parseInt(this.dataset.autoPages, 10);
        if (isNaN(this.autoLeft)) this.autoLeft = 2;
        this.historyMode = this.dataset.history || 'replace';
        this.loading = false;

        const scope = this.closest('.shopify-section') || document;
        this.container = scope.querySelector(this.containerSelector) || document.querySelector(this.containerSelector);

        this.spinnerEl = this.querySelector('.eh-load-more__spinner');
        this.buttonEl = this.querySelector('.eh-load-more__btn');
        this.errorEl = this.querySelector('.eh-load-more__error');
        this.statusEl = this.querySelector('.eh-load-more__status');

        if (!this.container) return;

        // JS aktifken native pagination'ı gizle (no-JS/crawler için markup'ta kalır)
        scope.querySelectorAll('.pagination-wrapper').forEach((el) => el.classList.add('eh-hidden'));

        this.buttonEl?.addEventListener('click', () => this.fetchNext(false));
        this.removeAttribute('hidden');

        if (!this.nextUrl) {
          this.setExhausted();
        } else if (this.autoLeft > 0) {
          this.observe();
        } else {
          this.showButton();
        }
      }

      disconnectedCallback() {
        this.observer?.disconnect();
        this.abortController?.abort();
      }

      observe() {
        this.observer =
          this.observer ||
          new IntersectionObserver(
            (entries) => {
              if (!entries[0].isIntersecting) return;
              this.observer.unobserve(this);
              this.fetchNext(true);
            },
            { rootMargin: '0px 0px 600px 0px' }
          );
        this.observer.observe(this);
      }

      showButton() {
        this.spinnerEl?.setAttribute('hidden', '');
        this.buttonEl?.removeAttribute('hidden');
      }

      setExhausted() {
        this.observer?.disconnect();
        this.spinnerEl?.setAttribute('hidden', '');
        this.buttonEl?.setAttribute('hidden', '');
        this.errorEl?.setAttribute('hidden', '');
        this.setAttribute('hidden', '');
      }

      fetchNext(isAuto) {
        if (this.loading || !this.nextUrl) return;
        this.loading = true;
        this.abortController = new AbortController();

        this.buttonEl?.setAttribute('hidden', '');
        this.errorEl?.setAttribute('hidden', '');
        this.spinnerEl?.removeAttribute('hidden');
        this.setAttribute('aria-busy', 'true');

        const url = new URL(this.nextUrl, window.location.origin);
        url.searchParams.set('section_id', this.sectionId);

        fetch(url.toString(), { signal: this.abortController.signal })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
          })
          .then((text) => {
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const fetchedContainer = doc.querySelector(this.containerSelector);
            const items = fetchedContainer ? fetchedContainer.querySelectorAll(this.itemSelector) : [];

            items.forEach((item) => {
              // Dawn'ın enjekte-içerik deseni: scroll-trigger animasyonunu iptal et (facets.js ile aynı)
              item.classList.add('scroll-trigger--cancel', 'eh-infscroll-appended');
              item.querySelectorAll('.scroll-trigger').forEach((el) => el.classList.add('scroll-trigger--cancel'));
              this.container.appendChild(item);
            });

            const fetchedSelf = doc.querySelector('eh-infinite-scroll');
            let newNext = fetchedSelf?.dataset.nextUrl;
            if (!newNext) {
              newNext = doc.querySelector('.pagination-wrapper a.pagination__item--prev')?.getAttribute('href') || null;
            }
            if (newNext) {
              const nextParsed = new URL(newNext, window.location.origin);
              nextParsed.searchParams.delete('section_id');
              newNext = nextParsed.pathname + nextParsed.search;
            }

            this.currentPage = parseInt(fetchedSelf?.dataset.currentPage, 10) || this.currentPage + 1;
            if (this.historyMode === 'replace') {
              const pageUrl = new URL(window.location.href);
              pageUrl.searchParams.set('page', this.currentPage);
              // history.state korunur — facets.js popstate'i state.searchParams okur
              history.replaceState(history.state, '', pageUrl.toString());
            }

            if (this.statusEl) this.statusEl.textContent = `${items.length} öğe daha yüklendi`;

            if (isAuto) this.autoLeft -= 1;
            this.nextUrl = newNext;

            if (!this.nextUrl) {
              this.setExhausted();
            } else if (this.autoLeft > 0) {
              this.observe();
            } else {
              this.showButton();
            }
          })
          .catch((error) => {
            if (error.name === 'AbortError') return;
            this.errorEl?.removeAttribute('hidden');
            this.showButton();
          })
          .finally(() => {
            this.loading = false;
            this.spinnerEl?.setAttribute('hidden', '');
            this.removeAttribute('aria-busy');
          });
      }
    }
  );
}
