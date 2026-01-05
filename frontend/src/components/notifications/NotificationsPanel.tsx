import { useSocket } from '@/hooks/useSocket'
import { useState } from 'react'
import { toast } from 'sonner'

const NotificationsPanel = () => {
  const [events, setEvents] = useState<any[]>([])

  useSocket((p) => {
    const e = { type: 'product:update', payload: p, ts: Date.now() }
    setEvents((s) => [e, ...s].slice(0, 50))
  }, (a) => {
    const e = { type: 'alert:new', payload: a, ts: Date.now() }
    setEvents((s) => [e, ...s].slice(0, 50))
    toast(`${a.type}: ${a.message}`)
  })

  return (
    <div className="p-2 border rounded bg-card max-h-80 overflow-auto">
      <h4 className="font-semibold">Live Notifications</h4>
      {events.length === 0 && <div className="text-sm text-muted">No events yet</div>}
      <ul className="space-y-2 text-sm">
        {events.map((e, i)=>(<li key={i} className="border-b py-1">{new Date(e.ts).toLocaleTimeString()} - <strong>{e.type}</strong> - {JSON.stringify(e.payload)}</li>))}
      </ul>
    </div>
  )
}

export default NotificationsPanel
