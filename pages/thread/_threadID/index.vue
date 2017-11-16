<template>
<div>
    <v-card>
      <v-card-media 
        v-if="thread.image && thread.image._id"
        :src="config.baseURL + '/image/' + thread.image._id + '/' + (thread.image.showFullSize ? '': 'pre') + 'view'"
        :height="thread.image.showFullSize ? thread.image.height : '200px'"
        @click.native="thread.image.showFullSize = !thread.image.showFullSize"
        style="cursor: pointer;"
        contain>
      </v-card-media>

      <v-card-title primary-title>
        <nuxt-link 
          :to="'/thread/' + thread._id" 
          style="text-decoration: none;"
          class="blue-grey--text text--lighten-4">
          <span class="title">{{ thread.title }}</span>
        </nuxt-link>
        <span class="caption pl-2">#{{ thread._id }}</span>
        <span class="caption pl-2">{{ (new Date(thread.createdDate))/1000 | relativeTime }}</span>
        <span class="caption pl-2" v-if="thread.image && thread.image.name">Image: {{ thread.image.name }} ({{ thread.image.width }}x{{ thread.image.height }}, {{ (thread.image.bytes || 0) | prettyBytes }})</span>
      </v-card-title>

      <v-card-text>
        {{ thread.text }}
      </v-card-text>

      <div class="post mt-1" v-for="post in thread.posts" :key="post._id">
          <v-card color="grey darken-2">
            <v-card-title>
              <span class="caption">Post #{{ post._id }}</span>
              <span class="caption pl-2">{{ (new Date(post.createdDate)/1000) | relativeTime }}</span>
              <span class="caption pl-2">Pinned: {{ post.pinned }}</span>
              <span class="caption pl-2" v-if="post.image && post.image.name">Image: {{ post.image.name }} ({{ post.image.width }}x{{ post.image.height }}, {{ (post.image.bytes || 0) | prettyBytes }})</span>
            </v-card-title>

            <v-card-media 
              v-if="post.image && post.image._id"
              :src="config.baseURL + '/image/' + post.image._id + '/' + (post.image.showFullSize ? '': 'pre') + 'view'" 
              :height="post.image.showFullSize ? post.image.height : '150px'" 
              @click.native="post.image.showFullSize = !post.image.showFullSize"
              style="cursor: pointer;"
              contain>
            </v-card-media>

            <v-card-text>
              {{ post.text }}
            </v-card-text>
          </v-card>
        </div>

        <div class="adding-post mt-2">
          <v-form>
            <v-card color="grey darken-4">
              <v-card-title>
                Add Your Own Post
              </v-card-title>
              
              <v-card-actions>
                <v-btn icon @click.native="thread.newPost.show = !thread.newPost.show">
                  <v-icon>
                    {{ thread.newPost.show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
                  </v-icon>
                </v-btn>
              </v-card-actions>

              <div class="post-form" v-show="thread.newPost.show">
                <v-card-media 
                  :src="thread.newPost.images && thread.newPost.images.length > 0 ? thread.newPost.images[0].url : ''"
                  :height="thread.newPost.images && thread.newPost.images.length > 0 ? '300px' : '0px'"
                  contain>
                </v-card-media>

                <v-card-text>
                  <file-upload
                    extensions="gif,jpg,jpeg,png"
                    accept="image/png,image/gif,image/jpeg"
                    name="new-post-image"
                    v-model="thread.newPost.images"
                    @input-filter="inputFilter"
                    :multiple="false">
                    <div class="btn primary pa-3 ml-0" style="cursor: pointer;">
                      Select File
                      <v-icon class="mx-1">cloud_upload</v-icon>
                    </div>
                  </file-upload>
                  <p class="subheading" v-if="thread.newPost.images && thread.newPost.images.length > 0">
                    {{ thread.newPost.images[0].name }} ({{ thread.newPost.images[0].size | prettyBytes }})
                  </p>

                  <v-text-field
                    label="Text"
                    v-model="thread.newPost.text"
                    counter="5000"
                    class="input-group--focused"
                    color="primary"
                    :rules="postTextRules"
                    multi-line
                    required>
                  </v-text-field>

                  <v-btn color="primary" @click="addPost(thread.newPost, thread._id)">
                    Post
                  </v-btn>
                </v-card-text>
              </div>
            </v-card>
          </v-form>
        </div>
    </v-card>
  </div>
</template>

<script>
import config from '~/assets/config.js'
import FileUpload from 'vue-upload-component/src'

export default {
  layout: 'thread',
  async asyncData ({ app, store, params }) {
    const threadID = params.threadID

    const { data: thread } = await app.$axios.$get(config.baseURL + '/thread/' + threadID)

    store.commit('setCurrentThread', thread)

    if (thread.image) {
      thread.image.showFullSize = false
    }

    const { data: posts } = await app.$axios.$get(config.baseURL + '/post/find?threadID=' + encodeURIComponent(threadID) + '&offset=0&limit=2000&sortBy=Default')

    thread.posts = posts.map((post) => {
      if (post.image) {
        post.image.showFullSize = false
      }

      return post
    })

    thread.newPost = {
      show: true,
      text: '',
      images: []
    }

    return {
      thread
    }
  },
  data () {
    return {
      config,
      postTextRules: [
        (value) => !!value || 'Text is required',
        (value) => (value && value.length >= 2) || 'Text must be more than 2 characters'
      ]
    }
  },
  methods: {
    fileSelected (e) {
      if (this.selectedCallback) {
        if (e.target.files[0]) {
          this.selectedCallback(e.target.files[0])
        } else {
          this.selectedCallback(null)
        }
      }
    },
    inputFilter (newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        if (!/\.(gif|jpg|jpeg|png|webp)$/i.test(newFile.name)) {
          this.alert('Your choice is not a picture')
          return prevent()
        }
      }
      if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
        newFile.url = ''
        let URL = window.URL || window.webkitURL
        if (URL && URL.createObjectURL) {
          newFile.url = URL.createObjectURL(newFile.file)
        }
      }
    },
    async addPost (postData, threadID) {
      if (postData.text.length < 2) {
        return
      }

      const formData = new FormData()

      formData.append('threadID', threadID)
      formData.append('text', postData.text)

      if (postData.images && postData.images.length > 0) {
        formData.append('main-image', postData.images[0].file)
      }

      const { data: submitedPost } = await this.$axios.$post(this.config.baseURL + '/post', formData)

      const { data: post } = await this.$axios.$get(this.config.baseURL + '/post/' + submitedPost._id)

      if (post.image) {
        post.image.showFullSize = false
      }

      this.thread.posts.push(post)

      this.thread.newPost = {
        show: false,
        text: '',
        images: []
      }
    }
  },
  components: {
    FileUpload
  }
}
</script>
