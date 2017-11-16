<template>
  <v-app dark>
    <v-toolbar dark color="grey darken-4" flat>
      <v-toolbar-title>/{{ currentBoard.name }}/</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        @click.native="toggleAddingThread()"
        fab
        small
        bottom
        right
        color="grey darken-3"
        absolute>
        <v-icon>add</v-icon>
      </v-btn> 
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
import { mapState } from 'vuex'

export default {
  data () {
    return {
      fixed: false
    }
  },
  computed: mapState([
    'currentBoard'
  ]),
  methods: {
    toggleAddingThread () {
      this.$store.commit('toggleAddingThread')
    }
  }
}
</script>
