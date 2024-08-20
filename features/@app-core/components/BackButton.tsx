import React from 'react'
import { View, Text, Link } from '../components/styled'
import { useRouter } from '@green-stack/navigation/useRouter'
import { ArrowLeftFilled } from '../icons/ArrowLeftFilled'
import { schema, z } from '@green-stack/schemas'

/* --- Props ----------------------------------------------------------------------------------- */

const BackButtonProps = schema('BackButtonProps', {
  color: z.string().optional(),
  backLink: z.string().default('/'),
})

type BackButtonProps = z.input<typeof BackButtonProps>

/* --- <BackButton/> --------------------------------------------------------------------------- */

const BackButton = (props: BackButtonProps) => {
  // Props
  const { color, backLink } = BackButtonProps.applyDefaults(props)

  // Routing
  const { canGoBack, back } = useRouter()

  // Vars
  const showBackButton = canGoBack()
  const textColor = color ? `text-[${color}]` : 'text-white'

  // -- Render --

  return (
    <View className="flex flex-row absolute top-8 web:top-0 left-0 p-4 items-center">
      <ArrowLeftFilled fill={color || '#FFFFFF'} size={18} />
      <View className="w-[5px]" />
      {showBackButton ? (
        <Text
          className={`text-lg ${textColor}`}
          onPress={back}
        >
          {`Back`}
        </Text>
      ) : (
        <Link href={backLink} className={`text-lg ${textColor} no-underline`}>
          {`Back`}
        </Link>
      )}
    </View>
  )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default BackButton
