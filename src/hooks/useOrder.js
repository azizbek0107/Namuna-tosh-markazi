import { useState, useCallback, useEffect } from 'react';
import { ORDER_STEPS } from '../utils/orderUtils.js';
import { validateCustomerFields, isCustomerValid } from '../utils/validationUtils.js';
import { getQuantityModes } from '../utils/calculatorUtils.js';
import { sizeKey } from '../utils/catalogUtils.js';
import { calculateOrder } from '../utils/calculatorUtils.js';
import { useCurrentTime } from './useCountdown.js';

/**
 * useOrder — manages the full modal order workflow state.
 *
 * Steps: editing → review → ready_to_copy → copied / telegram_opened
 *
 * Privacy: customer fields are held in component memory only; never logged or stored.
 */
export default function useOrder(product) {
  const now = useCurrentTime();

  const modes = product ? getQuantityModes(product) : ['direct'];
  const defaultMode = product?.orderConfig?.defaultQuantityMode && modes.includes(product.orderConfig.defaultQuantityMode)
    ? product.orderConfig.defaultQuantityMode
    : modes[0];
  const defaultSizeKey = product?.sizes?.[0] ? sizeKey(product.sizes[0]) : '';

  const [step, setStep] = useState(ORDER_STEPS.EDITING);
  const [selectedSize, setSelectedSize] = useState(defaultSizeKey);
  const [quantity, setQuantity] = useState('1');
  const [mode, setMode] = useState(defaultMode);
  const [customer, setCustomer] = useState({ name: '', phone: '', comment: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (product?.sizes?.length) {
      const exists = product.sizes.some(item => sizeKey(item) === selectedSize);
      if (!exists) {
        setSelectedSize(sizeKey(product.sizes[0]));
      }
    }
  }, [product, selectedSize]);

  if (!product) {
    return {
      step: ORDER_STEPS.EDITING,
      selectedSize: '',
      size: null,
      quantity: '1',
      mode: 'direct',
      modes: ['direct'],
      customer: { name: '', phone: '', comment: '' },
      fieldErrors: {},
      calculation: { valid: false, error: '' },
      now,
      canProceed: false,
      setSelectedSize: () => {},
      setQuantity: () => {},
      setMode: () => {},
      changeCustomer: () => {},
      blurField: () => {},
      goToReview: () => false,
      goToReady: () => {},
      goBackToEditing: () => {},
      markCopied: () => {},
      markTelegramOpened: () => {},
      reset: () => {},
    };
  }

  const size = product.sizes?.find(item => sizeKey(item) === selectedSize) ?? null;
  const calculation = calculateOrder(product, { size, quantity, mode, now });

  // ── Customer field handlers ──────────────────────────────────────────────
  const changeCustomer = useCallback((field, value) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    // If user edits after review, go back to editing step
    setStep(prev => prev !== ORDER_STEPS.EDITING ? ORDER_STEPS.EDITING : prev);
  }, []);

  const blurField = useCallback((field) => {
    setFieldErrors(prev => {
      const errs = validateCustomerFields(customer);
      return { ...prev, [field]: errs[field] };
    });
  }, [customer]);

  // ── Mode change resets quantity to avoid silent float→int coercion ───────
  const changeMode = useCallback((next) => {
    setMode(next);
    setQuantity('1');
  }, []);

  // ── Step transitions ─────────────────────────────────────────────────────
  const goToReview = useCallback(() => {
    const errs = validateCustomerFields(customer);
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      // Focus the first invalid field
      const first = Object.keys(errs)[0];
      document.getElementById(`om-${first}`)?.focus();
      return false;
    }
    if (!calculation.valid) return false;
    setStep(ORDER_STEPS.REVIEW);
    return true;
  }, [customer, calculation.valid]);

  const goToReady = useCallback(() => {
    setStep(ORDER_STEPS.READY);
  }, []);

  const goBackToEditing = useCallback(() => {
    setStep(ORDER_STEPS.EDITING);
  }, []);

  const markCopied = useCallback(() => {
    setStep(ORDER_STEPS.COPIED);
  }, []);

  const markTelegramOpened = useCallback(() => {
    setStep(ORDER_STEPS.TELEGRAM_OPENED);
  }, []);

  const reset = useCallback(() => {
    setStep(ORDER_STEPS.EDITING);
    setSelectedSize(defaultSizeKey);
    setQuantity('1');
    setMode(defaultMode);
    setCustomer({ name: '', phone: '', comment: '' });
    setFieldErrors({});
  }, [defaultSizeKey, defaultMode]);

  return {
    // state
    step,
    selectedSize, size,
    quantity,
    mode, modes,
    customer,
    fieldErrors,
    calculation,
    now,
    // derived
    canProceed: calculation.valid && isCustomerValid(customer),
    // handlers
    setSelectedSize,
    setQuantity,
    setMode: changeMode,
    changeCustomer,
    blurField,
    // step nav
    goToReview,
    goToReady,
    goBackToEditing,
    markCopied,
    markTelegramOpened,
    reset,
  };
}
