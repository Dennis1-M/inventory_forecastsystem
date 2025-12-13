import { create } from "zustand";

export const useFormStore = create((set) => ({
  // Form state
  forms: {},

  // Initialize a form
  initForm: (formName, initialValues) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          values: initialValues,
          errors: {},
          touched: {},
          isSubmitting: false,
          isDirty: false,
        },
      },
    })),

  // Update form values
  setFieldValue: (formName, fieldName, value) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          values: {
            ...state.forms[formName].values,
            [fieldName]: value,
          },
          isDirty: true,
        },
      },
    })),

  // Set multiple field values
  setValues: (formName, values) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          values: {
            ...state.forms[formName].values,
            ...values,
          },
          isDirty: true,
        },
      },
    })),

  // Set field error
  setFieldError: (formName, fieldName, error) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          errors: {
            ...state.forms[formName].errors,
            [fieldName]: error,
          },
        },
      },
    })),

  // Set multiple errors
  setErrors: (formName, errors) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          errors,
        },
      },
    })),

  // Mark field as touched
  setFieldTouched: (formName, fieldName, isTouched = true) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          touched: {
            ...state.forms[formName].touched,
            [fieldName]: isTouched,
          },
        },
      },
    })),

  // Set submitting state
  setSubmitting: (formName, isSubmitting) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          isSubmitting,
        },
      },
    })),

  // Reset form
  resetForm: (formName, initialValues) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          values: initialValues,
          errors: {},
          touched: {},
          isSubmitting: false,
          isDirty: false,
        },
      },
    })),

  // Get form state
  getForm: (formName) => {
    return (state) => state.forms[formName] || null;
  },

  // Delete form
  deleteForm: (formName) =>
    set((state) => {
      const newForms = { ...state.forms };
      delete newForms[formName];
      return { forms: newForms };
    }),
}));
