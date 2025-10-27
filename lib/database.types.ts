export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'administrateur' | 'agent' | 'conseiller'
export type QualiteStatus = 'valide' | 'non_valide'
export type StatutConseiller = 'en_attente' | 'ok' | 'non_ok' | 'rappeler'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          nom_societe: string
          nom_client: string
          telephone: string | null
          mail: string | null
          formule_juridique: string | null
          departement: string | null
          numero_siret: string | null
          date_rdv: string | null
          heure_rdv: string | null
          qualite: QualiteStatus
          commentaire: string | null
          agent_id: string | null
          conseiller_id: string | null
          created_by: string | null
          date_creation: string
          created_at: string
          updated_at: string
          statut_conseiller: StatutConseiller
          commentaire_conseiller: string | null
          date_suivi_conseiller: string | null
          conseiller_suivi_id: string | null
        }
        Insert: {
          id?: string
          nom_societe: string
          nom_client: string
          telephone?: string | null
          mail?: string | null
          formule_juridique?: string | null
          departement?: string | null
          numero_siret?: string | null
          date_rdv?: string | null
          heure_rdv?: string | null
          qualite?: QualiteStatus
          commentaire?: string | null
          agent_id?: string | null
          conseiller_id?: string | null
          created_by?: string | null
          date_creation?: string
          created_at?: string
          updated_at?: string
          statut_conseiller?: StatutConseiller
          commentaire_conseiller?: string | null
          date_suivi_conseiller?: string | null
          conseiller_suivi_id?: string | null
        }
        Update: {
          id?: string
          nom_societe?: string
          nom_client?: string
          telephone?: string | null
          mail?: string | null
          formule_juridique?: string | null
          departement?: string | null
          numero_siret?: string | null
          date_rdv?: string | null
          heure_rdv?: string | null
          qualite?: QualiteStatus
          commentaire?: string | null
          agent_id?: string | null
          conseiller_id?: string | null
          created_by?: string | null
          date_creation?: string
          created_at?: string
          updated_at?: string
          statut_conseiller?: StatutConseiller
          commentaire_conseiller?: string | null
          date_suivi_conseiller?: string | null
          conseiller_suivi_id?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          lead_id: string
          user_id: string | null
          type: string
          description: string
          date_activite: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id?: string | null
          type: string
          description: string
          date_activite?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string | null
          type?: string
          description?: string
          date_activite?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: UserRole
      }
      get_lead_stats: {
        Args: {
          user_id?: string
        }
        Returns: {
          total_leads: number
          nouveaux: number
          contactes: number
          qualifies: number
          negocies: number
          gagnes: number
          perdus: number
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      qualite_status: QualiteStatus
      statut_conseiller: StatutConseiller
    }
  }
}
