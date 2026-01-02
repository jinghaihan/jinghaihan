import type { UserModule } from '@/types'
import progress from 'nprogress'
import { isClient } from '@/utils'

export const install: UserModule = ({ router }) => {
  router.beforeEach((to, from) => {
    if (to.path !== from.path && isClient())
      progress.start()
  })
  router.afterEach(() => {
    if (isClient())
      progress.done()
  })
}
