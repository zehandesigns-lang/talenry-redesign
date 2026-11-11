import { useId, type InputHTMLAttributes } from 'react'
import { inputClass } from './styles.ts'

type TextFieldProps = {
  label: string
  /** One line on why the question is asked */
  hint?: string
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({ label, hint, className = '', ...inputProps }: TextFieldProps) {
  const id = useId()

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...inputProps}
        className={`mt-2 ${inputClass}`}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-ui-sm text-subtle">
          {hint}
        </p>
      )}
    </div>
  )
}
