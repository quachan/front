import Vue from 'vue'
import filesize from 'filesize'
import { relativeTime } from 'humanize'

Vue.filter('prettyBytes', (value) => {
  return filesize(value)
})

Vue.filter('relativeTime', (value) => {
  return relativeTime(value)
})
