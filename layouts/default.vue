<template>
  <v-app dark>
    <v-toolbar dark color="grey darken-4" flat>
      <v-toolbar-title>chan</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
          <nuxt />
        </v-container>
      </v-content>
    </main>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      title: 'Vuetify.js',
      fixed: false
    }
  }
}
</script>
