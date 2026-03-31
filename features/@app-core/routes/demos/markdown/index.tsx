import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import MarkdownScreen from '../../../../@app-demo/screens/MarkdownScreen'

/* --- /images --------------------------------------------------------------------------------- */

export default (props: any) => (
    <UniversalRouteScreen
        {...props}
        routeScreen={MarkdownScreen}
    />
)
