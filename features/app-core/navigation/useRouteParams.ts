import { useContext } from 'react'
import { CoreContext } from '../context/CoreContext'
import { UniversalRouteScreenProps } from './useRouteParams.types'

/** --- useRouteParams() ----------------------------------------------------------------------- */
/** -i- Gets the route search and query params on both web and mobile */
export const useRouteParams = (routeScreenProps: UniversalRouteScreenProps) => {
    const { useContextRouteParams } = useContext(CoreContext)
    return useContextRouteParams(routeScreenProps)
}
