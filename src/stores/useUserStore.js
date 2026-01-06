import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useEventStore } from './useEventStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    // Initiera - kolla om användare redan är inloggad
    async initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        this.session = session
        this.user = session?.user || null

        if (this.user) {
          await this.fetchProfile()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      }
    },

    // Hämta användarprofil från "profiles" tabellen
    async fetchProfile() {
      if (!this.user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .single()

        if (error) throw error
        this.profile = data
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    },

    // Registrera ny användare
    async signUp(email, password, userData) {
      this.isLoading = true
      this.error = null

      try {
        // 1. Skapa användare i Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData.fullName,
            },
          },
        })

        if (error) throw error

        // 2. OBS: SKIPPA manuell INSERT i profiles-tabellen!
        // Låt triggern eller RLS-policyn hantera detta

        // 3. Sätt local state om signup lyckades
        this.user = data.user
        this.session = data.session

        // 4. Vänta lite och hämta profilen (om trigger finns)
        if (data.user) {
          setTimeout(async () => {
            await this.fetchProfile()
          }, 1000)
        }

        return {
          success: true,
          needsEmailConfirmation: !data.session,
        }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    // Logga in
    async signIn(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        this.user = data.user
        this.session = data.session
        await this.fetchProfile()

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    // Logga ut
    async signOut() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.session = null
        this.profile = null

        // Rensa event registreringar
        const eventStore = useEventStore()
        // Du kan lägga till logik för att spara användarens data innan utloggning
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },

    // Uppdatera profil
    async updateProfile(updates) {
      try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', this.user.id)

        if (error) throw error

        await this.fetchProfile() // Uppdatera lokalt state
        return { success: true }
      } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.profile?.full_name || state.user?.email?.split('@')[0],
  },
})
