import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useEventStore = defineStore('events', {
  state: () => ({
    events: [],
    isLoading: false,
    error: null,
    registrations: JSON.parse(localStorage.getItem('eventRegistrations') || '[]')
  }),
  
  actions: {
    async fetchEvents() {
      this.isLoading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('Events')  // Obs: Stort E om din tabell heter "Events"
          .select('*')
          .order('date', { ascending: true })
        
        if (error) throw error
        
        // Lägg till registration status från localStorage
        this.events = data.map(event => ({
          ...event,
          isRegistered: this.registrations.includes(event.id)
        }))
      } catch (error) {
        this.error = error.message
        console.error('Error fetching events:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
  
  getters: {
    registrationOpen: (state) => {
      return state.events.filter(event => event.registration_open)
    },
    
    registeredEvents: (state) => {
      return state.events.filter(event => state.registrations.includes(event.id))
    }
  }
})