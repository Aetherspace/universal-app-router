import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import MarkdownScreen from '../../../screens/MarkdownScreen'

/* --- /images --------------------------------------------------------------------------------- */

export default (props: any) => (
    <UniversalRouteScreen
        {...props}
        routeScreen={MarkdownScreen}
    />
)
