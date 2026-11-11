import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { inputClass } from './styles.ts'

type SelectFieldProps = {
  label: string
  options: { value: string; label: string }[]
  /** Shown while nothing is picked */
  placeholder: string
} & SelectHTMLAttributes<HTMLSelectElement>

export function SelectField({ label, options, placeholder, className = '', ...selectProps }: SelectFieldProps) {
  const id = useId()

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body">
        {label}
      </label>
      <div className="relative mt-2">
        <select id={id} {...selectProps} className={`${inputClass} appearance-none pr-12`}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
