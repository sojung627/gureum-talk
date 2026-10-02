import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'


function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative z-50 bg-transparent">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-6 py-8 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Gureum<span className="text-violet-500 dark:text-violet-300">Talk</span>
          </p>

          <p className="mt-1">
            {t('footerTagline')}</p>
          <p>© 2026 GureumTalk</p>
        </div>

        <div className="flex gap-6">
          <Link to="/help" className="hover:text-violet-500 dark:hover:text-violet-300">
            {t('terms')}</Link>

          <Link to="/help" className="hover:text-violet-500 dark:hover:text-violet-300">
            {t('privacy')}</Link>

          <Link to="/help" className="hover:text-violet-500 dark:hover:text-violet-300">
            {t('contact')}</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
