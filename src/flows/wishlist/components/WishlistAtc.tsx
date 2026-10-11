import { AnimatePresence, motion } from 'motion/react';
import { Icon, Pressable, QuantityStepper } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { wishlistTokens } from '../tokens';
import { ref } from '../../../foundations/tokens';

/**
 * NoonProductBoxWishlistAddToCart (V2): soft "Add to cart" button that morphs into a soft stepper.
 * Button ↔ stepper fade 140ms in / 90ms out; layout spring damping 16 / stiffness 180.
 */
export function WishlistAtc({ productId }: { productId: string }) {
  const { cart, addToCart, setQty } = useDemoStore();
  const qty = cart.find((l) => l.product.id === productId)?.qty ?? 0;
  const a = wishlistTokens.atc;
  return (
    <motion.div layout transition={{ type: 'spring', damping: 16, stiffness: 180 }} style={{ height: a.height, display: 'flex' }} onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="wait" initial={false}>
        {qty > 0 ? (
          <motion.div key="stepper" style={{ flex: 1, display: 'flex', alignItems: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.14 } }} exit={{ opacity: 0, transition: { duration: 0.09 } }}>
            <QuantityStepper variant="soft" value={qty} width={'100%' as unknown as number} onChange={(v) => setQty(productId, v)} />
          </motion.div>
        ) : (
          <motion.div key="btn" style={{ flex: 1, display: 'flex' }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.14 } }} exit={{ opacity: 0, transition: { duration: 0.09 } }}>
            <Pressable
              // no toast: the floating View Cart pill is the feedback, as in the app
              onClick={() => addToCart(productId)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 8, background: a.bg, color: a.ink, padding: '4px 8px', font: ref.type('text14SemiboldLh1') }}
            >
              <Icon name="plus" size={14} strokeWidth={2.6} />
              Add to cart
            </Pressable>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
