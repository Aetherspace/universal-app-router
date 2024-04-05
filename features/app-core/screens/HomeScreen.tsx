import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Link } from '../navigation/Link'

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo + Next.js app routing 👋</Text>
      <Text style={styles.subtitle}>Open HomeScreen.tsx in features/app-core/screens to start working on your app</Text>
      <Link href="/subpages/aetherspace" style={styles.link}>Test navigation</Link>
    </View>
  )
}

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
})

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
