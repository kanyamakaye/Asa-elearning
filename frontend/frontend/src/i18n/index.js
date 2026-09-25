// Static imports (not a runtime fetch) so every language ships in the same
// bundle and switching is instant — this app's translation set is small
// enough that lazy-loading per-language chunks isn't worth the complexity.
//
// Each namespace maps to a cluster of files that all own the same JSON file
// per language (see each translations/<lang>/<namespace>.json for which
// components/pages read from it) — this is what let the initial rollout be
// parallelized across the whole codebase without merge conflicts: every
// contributor only ever edits their own namespace's three files.
import en_public from './translations/en/public.json'
import en_auth from './translations/en/auth.json'
import en_dashboardChrome from './translations/en/dashboardChrome.json'
import en_dashboardStudent from './translations/en/dashboardStudent.json'
import en_dashboardInstructor from './translations/en/dashboardInstructor.json'
import en_dashboardAdmin from './translations/en/dashboardAdmin.json'
import en_sharedComponents from './translations/en/sharedComponents.json'

import rw_public from './translations/rw/public.json'
import rw_auth from './translations/rw/auth.json'
import rw_dashboardChrome from './translations/rw/dashboardChrome.json'
import rw_dashboardStudent from './translations/rw/dashboardStudent.json'
import rw_dashboardInstructor from './translations/rw/dashboardInstructor.json'
import rw_dashboardAdmin from './translations/rw/dashboardAdmin.json'
import rw_sharedComponents from './translations/rw/sharedComponents.json'

import fr_public from './translations/fr/public.json'
import fr_auth from './translations/fr/auth.json'
import fr_dashboardChrome from './translations/fr/dashboardChrome.json'
import fr_dashboardStudent from './translations/fr/dashboardStudent.json'
import fr_dashboardInstructor from './translations/fr/dashboardInstructor.json'
import fr_dashboardAdmin from './translations/fr/dashboardAdmin.json'
import fr_sharedComponents from './translations/fr/sharedComponents.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'rw', label: 'Kinyarwanda', nativeLabel: 'Ikinyarwanda' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
]

export const FALLBACK_LANGUAGE = 'en'

export const dictionaries = {
  en: {
    public: en_public,
    auth: en_auth,
    dashboardChrome: en_dashboardChrome,
    dashboardStudent: en_dashboardStudent,
    dashboardInstructor: en_dashboardInstructor,
    dashboardAdmin: en_dashboardAdmin,
    sharedComponents: en_sharedComponents,
  },
  rw: {
    public: rw_public,
    auth: rw_auth,
    dashboardChrome: rw_dashboardChrome,
    dashboardStudent: rw_dashboardStudent,
    dashboardInstructor: rw_dashboardInstructor,
    dashboardAdmin: rw_dashboardAdmin,
    sharedComponents: rw_sharedComponents,
  },
  fr: {
    public: fr_public,
    auth: fr_auth,
    dashboardChrome: fr_dashboardChrome,
    dashboardStudent: fr_dashboardStudent,
    dashboardInstructor: fr_dashboardInstructor,
    dashboardAdmin: fr_dashboardAdmin,
    sharedComponents: fr_sharedComponents,
  },
}
