<template>
  <div>
    <div class="adding-thread my-2" v-show="addingThread">
      <v-form>
        <v-card color="grey darken-4">
          <v-card-media 
            :src="newThread.images && newThread.images.length > 0 ? newThread.images[0].url : ''"
            :height="newThread.images && newThread.images.length > 0 ? '300px' : '0px'"
            contain>
          </v-card-media>

          <v-card-text>
            <file-upload
              extensions="gif,jpg,jpeg,png"
              accept="image/png,image/gif,image/jpeg"
              name="new-post-image"
              v-model="newThread.images"
              @input-filter="inputFilter"
              :multiple="false">
              <div class="btn primary pa-3 ml-0" style="cursor: pointer;">
                Select File
                <v-icon class="mx-1">cloud_upload</v-icon>
              </div>
            </file-upload>
            <p class="subheading" v-if="newThread.images && newThread.images.length > 0">
              {{ newThread.images[0].name }} ({{ newThread.images[0].size | prettyBytes }})
            </p>

            <v-text-field
              label="Title"
              v-model="newThread.title"
              counter="40"
              class="input-group--focused"
              color="primary"
              :rules="threadTitleRules"
              required>
            </v-text-field>

            <v-text-field
              label="Text"
              v-model="newThread.text"
              counter="5000"
              class="input-group--focused"
              color="primary"
              :rules="threadTextRules"
              multi-line
              required>
            </v-text-field>

            <v-btn color="primary" @click.native="addThread(newThread, currentBoard._id)">
              Post
            </v-btn>
          </v-card-text>
        </v-card>
      </v-form>
    </div>

    <div class="thread mb-4" v-for="thread in threads" :key="thread._id">
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
          <span class="caption pl-2">
            <v-tooltip bottom>
              <a
                slot="activator"
                style="text-decoration: none; cursor: pointer;"
                class="blue-grey--text"
                @click="replyTo(thread._id, thread)">
                #{{ thread._id }}
              </a>
              <span>
                Reply
              </span>
            </v-tooltip>
          </span>
          <span class="caption pl-2">{{ (new Date(thread.createdDate))/1000 | relativeTime }}</span>
          <span class="caption pl-2">Pinned: {{ thread.pinned }}</span>
          <span class="caption pl-2 blue-grey--text text--lighten-3" v-if="thread.image && thread.image.name">Image: {{ thread.image.name }} ({{ thread.image.width }}x{{ thread.image.height }}, {{ (thread.image.bytes || 0) | prettyBytes }})</span>
        </v-card-title>

        <v-card-text>
          {{ thread.text }}
        </v-card-text>

        <v-btn block class="secondary" :to="'/thread/' + thread._id" >
          Show Full Thread
        </v-btn>

        <div class="post mt-1" v-for="post in reverse(limitBy(thread.posts, 0, 2))" :key="post._id">
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
              <user-text :text="post.text"></user-text>
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

                  <v-btn color="primary" @click.native="addPost(thread.newPost, thread._id)">
                    Post
                  </v-btn>
                </v-card-text>
              </div>
            </v-card>
          </v-form>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import config from '~/assets/config.js'
import { mapState } from 'vuex'
import FileUpload from 'vue-upload-component/src'
import FormData from 'form-data'
import UserText from '~/components/UserText.vue'

export default {
  layout: 'board',
  async asyncData ({ app, store, params }) {
    const boardName = params.boardName

    const { data: board } = await app.$axios.$get(config.baseURL + '/board/find?name=' + encodeURIComponent(boardName))

    store.commit('setCurrentBoard', board)

    let { data: threads } = await app.$axios.$get(config.baseURL + '/thread/find?boardID=' + encodeURIComponent(board._id) + '&sortBy=Bump&offset=0&limit=100')

    threads = await Promise.all(threads.slice(0, 10).map(async (thread) => {
      const { data: posts } = await app.$axios.$get(config.baseURL + '/post/find?threadID=' + encodeURIComponent(thread._id) + '&offset=0&limit=2&sortBy=NewToOld')

      thread.posts = posts

      return thread
    }))

    const threadsUser = threads.map((thread) => {
      if (thread.image) {
        thread.image.showFullSize = false
      }

      thread.newPost = {
        show: false,
        text: '',
        images: []
      }

      thread.posts = thread.posts.map((post) => {
        if (post.image) {
          post.image.showFullSize = false
        }

        return post
      })

      return thread
    })

    return {
      threads: threadsUser
    }
  },
  data () {
    return {
      config,
      threadTitleRules: [
        (value) => !!value || 'Title is required',
        (value) => (value && value.length >= 4) || 'Title must be more than 4 characters'
      ],
      threadTextRules: [
        (value) => !!value || 'Text is required',
        (value) => (value && value.length >= 2) || 'Text must be more than 2 characters'
      ],
      postTextRules: [
        (value) => !!value || 'Text is required',
        (value) => (value && value.length >= 2) || 'Text must be more than 2 characters'
      ],
      newThread: {
        title: '',
        text: '',
        images: []
      },
      threads: []
    }
  },
  computed: mapState([
    'addingThread',
    'currentBoard'
  ]),
  methods: {
    limitBy (array, start, end) {
      return array.slice(start, end)
    },
    reverse (array) {
      return array.reverse()
    },
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
    async addThread (threadData, boardID) {
      if (threadData.title.length < 4 || threadData.text.length < 2) {
        return
      }

      const formData = new FormData()

      formData.append('boardID', boardID)
      formData.append('title', threadData.title)
      formData.append('text', threadData.text)

      if (threadData.images && threadData.images.length > 0) {
        formData.append('main-image', threadData.images[0].file)
      }

      const { data: submitedThread } = await this.$axios.$post(this.config.baseURL + '/thread', formData)

      const { data: thread } = await this.$axios.$get(this.config.baseURL + '/thread/' + submitedThread._id)

      if (thread.image) {
        thread.image.showFullSize = false
      }

      thread.posts = []

      thread.newPost = {
        show: false,
        text: '',
        images: []
      }

      this.newThread = {
        title: '',
        text: '',
        images: []
      }

      this.threads.unshift(thread)

      this.$store.commit('toggleAddingThread')
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

      this.threads.find((thread) => thread._id === threadID).posts.unshift(post)
      this.threads.find((thread) => thread._id === threadID).newPost = {
        show: false,
        text: '',
        images: []
      }
    },
    replyTo (id, thread) {
      thread.newPost.show = true

      thread.newPost.text += '@' + id + ' '
    }
  },
  components: {
    FileUpload,
    UserText
  }
}
</script>
