import { AlertCircle } from 'lucide-react'

export function FormError({ message }: { message: string }) {
   if(!message) return null;
   return (
      <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(244,120,112,0.15)', border: '1px solid rgba(244,120,112,0.3)' }}>
         <AlertCircle size={16} style={{ color: '#F47870', flexShrink: 0, marginTop: 1 }} />
         <p style={{ color: '#F47870', fontSize: 13 }}>{message}</p>
      </div>
   )
}