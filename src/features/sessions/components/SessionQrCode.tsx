import QRCode from 'react-qr-code'

export function SessionQrCode({ pin }: { pin: string }) {
  const joinUrl = `${window.location.origin}/join?pin=${pin}`
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-md bg-white p-3">
        <QRCode value={joinUrl} size={160} />
      </div>
      <p className="text-sm text-muted-foreground">{joinUrl}</p>
    </div>
  )
}
