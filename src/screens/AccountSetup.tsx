import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import defaultAvatar from '../assets/avatar.png'
import { GoogleIcon, RefreshIcon } from '../components/icons.tsx'
import { SetupCard } from '../components/SetupCard.tsx'
import { focusRing, primaryButtonClass } from '../components/styles.ts'
import { TextField } from '../components/TextField.tsx'
import { toSquareAvatar } from '../lib/avatar.ts'
import { useOnboarding } from '../onboarding.ts'

export function AccountSetup() {
  const { account, updateAccount, goTo } = useOnboarding()
  const fileInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const canContinue = account.firstName.trim() !== '' && account.lastName.trim() !== ''

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again
    if (!file) return
    try {
      updateAccount({ photo: await toSquareAvatar(file) })
      setPhotoError(null)
    } catch (error) {
      setPhotoError((error as Error).message)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (canContinue) goTo('profile')
  }

  return (
    <SetupCard title="Set up your account" step="Step 1/2">
      <form onSubmit={handleSubmit}>
        <p className="mt-3 flex items-start gap-2 text-detail text-subtle">
          <GoogleIcon className="mt-[0.1em] size-4 shrink-0" />
          I filled in your name and photo from your Google account.
        </p>
        <div className="mt-6 flex items-center gap-6 sm:gap-7.75">
          <img
            src={account.photo ?? defaultAvatar}
            alt="Your profile photo"
            className="size-16 shrink-0 rounded-full object-cover sm:size-18"
          />
          <div className="flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-describedby="photo-hint"
              className={`flex h-11 items-center gap-2 rounded-full border border-ink px-2.5 text-body transition-colors hover:bg-black/5 ${focusRing}`}
            >
              <RefreshIcon className="size-6" />
              Replace Photo
            </button>
            <p
              id="photo-hint"
              aria-live="polite"
              className={`text-caption ${photoError ? 'text-danger' : 'text-subtle'}`}
            >
              {photoError ?? 'At least 300×300'}
            </p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="First Name"
            autoComplete="given-name"
            required
            value={account.firstName}
            onChange={(event) => updateAccount({ firstName: event.target.value })}
          />
          <TextField
            label="Last Name"
            autoComplete="family-name"
            required
            value={account.lastName}
            onChange={(event) => updateAccount({ lastName: event.target.value })}
          />
        </div>

        <button type="submit" disabled={!canContinue} className={`mt-8 ${primaryButtonClass}`}>
          Continue
        </button>
      </form>
    </SetupCard>
  )
}
