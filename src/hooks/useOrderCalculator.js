import { useState } from 'react';
import { useCurrentTime } from './useCountdown';
import { sizeKey } from '../utils/catalogUtils';
import { calculateOrder, getQuantityModes } from '../utils/calculatorUtils';

export default function useOrderCalculator(product) {
  const modes = getQuantityModes(product);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ? sizeKey(product.sizes[0]) : '');
  const [quantity, setQuantity] = useState('1');
  const [mode, setMode] = useState(modes.includes(product.orderConfig?.defaultQuantityMode) ? product.orderConfig.defaultQuantityMode : modes[0]);
  const now = useCurrentTime();
  const size = product.sizes?.find(item => sizeKey(item) === selectedSize) ?? null;
  const calculation = calculateOrder(product, { size, quantity, mode, now });
  function changeMode(next) {
    setMode(next);
    // Avoid silently rounding a customer's fractional quantity into a piece count.
    setQuantity('1');
  }
  return { selectedSize, setSelectedSize, size, quantity, setQuantity, mode, setMode: changeMode, modes, calculation, now };
}
