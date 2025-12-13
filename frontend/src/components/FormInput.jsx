import { AlertCircle } from "lucide-react";
import { forwardRef } from "react";

const FormInput = forwardRef(
  (
    {
      label,
      type = "text",
      name,
      value,
      onChange,
      onBlur,
      error,
      touched,
      placeholder,
      disabled = false,
      required = false,
      helperText,
      autoComplete,
      inputMode,
      pattern,
      minLength,
      maxLength,
      min,
      max,
      ...props
    },
    ref
  ) => {
    const showError = error && touched;

    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            inputMode={inputMode}
            pattern={pattern}
            minLength={minLength}
            maxLength={maxLength}
            min={min}
            max={max}
            aria-label={label || name}
            aria-invalid={showError ? "true" : "false"}
            aria-describedby={showError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              showError
                ? "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white"}`}
            {...props}
          />

          {showError && (
            <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
          )}
        </div>

        {showError && (
          <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}

        {helperText && !showError && (
          <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
