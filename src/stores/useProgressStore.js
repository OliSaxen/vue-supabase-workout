import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from './useUserStore'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    activities: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchActivities() {
      const userStore = useUserStore()
      if (!userStore.user) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userStore.user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        this.activities = data || []
      } catch (error) {
        this.error = error.message
        console.error('Error fetching activities:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addActivity(activityData) {
      const userStore = useUserStore()
      if (!userStore.user) return { success: false, error: 'Not authenticated' }
      
      this.isLoading = true
      this.error = null
      
      try {
        // Först kolla om det redan finns en aktivitet för samma datum och typ
        const { data: existing, error: fetchError } = await supabase
          .from('activities')
          .select('id')
          .eq('user_id', userStore.user.id)
          .eq('type', activityData.type)
          .eq('date', activityData.date)
          .maybeSingle()
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = ingen rad hittad
          throw fetchError
        }
        
        let result
        
        if (existing) {
          // Uppdatera befintlig
          const { data, error } = await supabase
            .from('activities')
            .update(activityData)
            .eq('id', existing.id)
            .select()
            .single()
          
          if (error) throw error
          result = data
          
          // Uppdatera i state
          const index = this.activities.findIndex(a => a.id === existing.id)
          if (index !== -1) {
            this.activities[index] = { ...result, user_id: userStore.user.id }
          }
        } else {
          // Skapa ny
          const { data, error } = await supabase
            .from('activities')
            .insert([{
              user_id: userStore.user.id,
              ...activityData
            }])
            .select()
            .single()
          
          if (error) throw error
          result = data
          
          // Lägg till i början av listan
          this.activities.unshift({ ...result, user_id: userStore.user.id })
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error adding/updating activity:', error)
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },
    
    async deleteActivity(activityId) {
      const userStore = useUserStore()
      if (!userStore.user) return { success: false, error: 'Not authenticated' }
      
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', activityId)
          .eq('user_id', userStore.user.id)
        
        if (error) throw error
        
        // Ta bort från state
        this.activities = this.activities.filter(a => a.id !== activityId)
        
        return { success: true }
      } catch (error) {
        console.error('Error deleting activity:', error)
        return { success: false, error: error.message }
      }
    }
  }
})