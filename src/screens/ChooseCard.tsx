import { BottomBar, TopBar, useSheets } from '../components/Chrome';
import { QrCode } from '../components/QrCode';
import { Sheet } from '../components/Sheet';
import { UiIcon } from '../components/UiIcon';
import { INKS, PRODUCTS, WEB_SHOP_URL } from '../data/catalog';
import { DEMO_CARD, PRODUCT_SAMPLE } from '../data/examples';
import { useDevice } from '../lib/hooks';
import { chf } from '../lib/pricing';
import { useStore } from '../state/store';
import type { ProductKey } from '../types';

const ORDER: ProductKey[] = ['greeting', 'postcard', 'letter'];

function ProductSample({ product }: { product: ProductKey }) {
  const { card } = useSheets({ ...DEMO_CARD, ...PRODUCT_SAMPLE, product, drawing: { kind: 'icon', icon: 'flower' }, ink: 'charcoal' });
  return <Sheet sheet={card} ink={INKS.charcoal.color} label={`Example ${PRODUCTS[product].label.toLowerCase()}`} />;
}

export function ChooseCard() {
  const { state, dispatch } = useStore();
  const device = useDevice();

  return (
    <>
      <TopBar />
      <main className="screen-body choose">
        <h1 className="screen-title">What would you like to write?</h1>
        <div className="products" role="radiogroup" aria-label="Card">
          {ORDER.map((key) => {
            const p = PRODUCTS[key];
            const on = state.product === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={on}
                className={`product${on ? ' is-on' : ''}`}
                onClick={() => dispatch({ type: 'SET_PRODUCT', product: key })}
              >
                <span className={`product-art product-art-${key}`}>
                  <ProductSample product={key} />
                </span>
                <span className="product-text">
                  <span className="product-name">
                    {p.label}
                    <span className="product-size">{p.sizeLabel}</span>
                  </span>
                  <span className="product-blurb">{p.blurb}</span>
                  <span className="product-price">{chf(p.price)}</span>
                </span>
                <span className="tick" aria-hidden="true">
                  <UiIcon name="check" size={18} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="shop-hint">
          {device === 'kiosk' && <QrCode value={WEB_SHOP_URL} size={72} label="QR code to the plotter web shop" />}
          <p>
            <strong>Need 20 cards or more, or one for everyone on a list?</strong>{' '}
            {device === 'kiosk' ? (
              'Our web shop writes them for you and posts them. Scan the code.'
            ) : (
              <>
                <a href={WEB_SHOP_URL} target="_blank" rel="noreferrer">
                  Our web shop
                </a>{' '}
                writes them for you and posts them.
              </>
            )}
          </p>
        </div>
      </main>
      <BottomBar
        back={{ label: device === 'kiosk' ? 'Start screen' : 'Back', onClick: () => dispatch({ type: 'RESET' }) }}
        next={{ label: 'Next', onClick: () => dispatch({ type: 'GO', screen: 'occasion' }) }}
      >
        <span className="bb-note">
          {PRODUCTS[state.product].label} · {chf(PRODUCTS[state.product].price)}
        </span>
      </BottomBar>
    </>
  );
}
