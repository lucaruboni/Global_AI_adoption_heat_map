import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useAppStore } from '../stores/useAppStore';
import { authService } from '../services/authService';
import { githubService } from '../services/githubService';
import { downloadService } from '../services/downloadService';
import { extractErrorMessage } from '../services/apiClient';
import { logger } from '../utils/logger';

interface FormValues {
  email: string;
  password: string;
  githubUsername?: string;
  linkedinUrl?: string;
  optedInNewsletter: boolean;
  starredRepo: boolean;
}

const repoUrl = githubService.configuredRepo
  ? `https://github.com/${githubService.configuredRepo}`
  : 'https://github.com';

/** Treats blank/whitespace-only input as absent (optional field). */
function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const field: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--pb)',
  background: 'rgba(255,255,255,.04)',
  color: 'var(--ink)',
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 13,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 10,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--sub)',
  marginBottom: 5,
  display: 'block',
};

const errText: React.CSSProperties = { color: '#ff6b6b', fontSize: 11, marginTop: 4 };

export function DownloadModal(): React.ReactElement {
  const setDownloadOpen = useAppStore((s) => s.setDownloadOpen);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { optedInNewsletter: true, starredRepo: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      try {
        await authService.register({
          email: values.email,
          password: values.password,
          githubUsername: blankToUndefined(values.githubUsername),
          linkedinUrl: blankToUndefined(values.linkedinUrl),
          optedInNewsletter: values.optedInNewsletter,
        });
      } catch (err) {
        // Already registered → log in with the same credentials and continue.
        if (err instanceof AxiosError && err.response?.status === 409) {
          await authService.login({ email: values.email, password: values.password });
        } else {
          throw err;
        }
      }
      await downloadService.fetchDataset();
      setDone(true);
    } catch (err) {
      logger.error('Download flow failed', err);
      setServerError(extractErrorMessage(err));
    }
  });

  return (
    <div
      onClick={() => setDownloadOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 96vw)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--panel)',
          border: '1px solid var(--pb)',
          borderRadius: 20,
          padding: 24,
          backdropFilter: 'blur(18px)',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Download the dataset</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 4 }}>
              Free & open. Leave your email so we can tell you when new data lands.
            </div>
          </div>
          <button
            onClick={() => setDownloadOpen(false)}
            style={{
              border: '1px solid var(--pb)',
              background: 'transparent',
              color: 'var(--sub)',
              borderRadius: 99,
              width: 30,
              height: 30,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {done ? (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>Your download has started</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>
              Thank you for supporting the project. Check your Downloads folder for
              <code style={{ color: 'var(--acc)' }}> ai-adoption-dataset.csv</code>.
            </div>
            <button
              onClick={() => setDownloadOpen(false)}
              style={{
                marginTop: 18,
                border: 'none',
                background: 'var(--acc)',
                color: '#14161c',
                borderRadius: 99,
                padding: '10px 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={field}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && <div style={errText}>{errors.email.message}</div>}
            </div>

            <div>
              <label style={labelStyle}>Password * (creates your account)</label>
              <input
                type="password"
                style={field}
                placeholder="at least 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
              />
              {errors.password && <div style={errText}>{errors.password.message}</div>}
            </div>

            <div>
              <label style={labelStyle}>GitHub username</label>
              <input style={field} placeholder="octocat" {...register('githubUsername')} />
            </div>

            <div>
              <label style={labelStyle}>LinkedIn profile URL</label>
              <input
                style={field}
                placeholder="https://linkedin.com/in/you"
                {...register('linkedinUrl')}
              />
            </div>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--sub)' }}>
              <input type="checkbox" {...register('optedInNewsletter')} />
              Email me when new datasets are released
            </label>

            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                padding: '10px',
                borderRadius: 10,
                border: '1px solid var(--pb)',
                background: 'rgba(255,255,255,.04)',
                color: 'var(--ink)',
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              ★ Star the project on GitHub
            </a>

            {serverError && <div style={errText}>{serverError}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                border: 'none',
                background: 'var(--acc)',
                color: '#14161c',
                borderRadius: 99,
                padding: '12px',
                fontWeight: 700,
                fontSize: 14,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Preparing…' : 'Download CSV ↓'}
            </button>
            <div style={{ fontSize: 10, color: 'var(--sub)', textAlign: 'center' }}>
              We store your email only to notify you about the dataset. No spam.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
