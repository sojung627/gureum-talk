import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { chatImageUrl, type ChatAttachment } from '../../api/chat'

type GalleryImage = { id: string; url?: string; file?: File }

function GalleryPhoto({ image, alt, className }: { image: GalleryImage; alt: string; className: string }) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!image.file) return
    const objectUrl = URL.createObjectURL(image.file)
    if (imageRef.current) imageRef.current.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [image.file])
  return <img ref={imageRef} src={image.url} alt={alt} className={className} />
}

export function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const { t } = useTranslation()
  const imageRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    if (imageRef.current) imageRef.current.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return (
    <div className="relative h-20 w-20 shrink-0">
      <img ref={imageRef} alt={file.name} className="h-full w-full rounded-xl object-cover" />
      <button type="button" onClick={onRemove} aria-label={t('removeImage')}
        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white">×</button>
    </div>
  )
}

export default function ChatImages({ attachments = [], localImages = [], isUploading = false }: {
  attachments?: ChatAttachment[]
  localImages?: File[]
  isUploading?: boolean
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const images: GalleryImage[] = localImages.length
    ? localImages.map((file, index) => ({ id: `local-${index}`, file }))
    : attachments.map(attachment => ({ id: attachment.attachment_id, url: chatImageUrl(attachment.url) }))
  const layout = images.length === 1
    ? 'w-48 grid-cols-1'
    : images.length === 2 ? 'w-[296px] grid-cols-2' : 'w-[360px] grid-cols-3'
  useEffect(() => {
    if (!selected) return
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [selected])
  return <>
    <div className={`relative grid max-w-full gap-1.5 ${layout}`}>
      {images.map((image, index) => (
        <button key={image.id} type="button" onClick={() => setSelected(image)}
          className="group relative aspect-square min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-sm transition hover:border-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:border-slate-700 dark:bg-slate-800"
          aria-label={t('enlargeImage', { number: index + 1 })}>
          <GalleryPhoto image={image} alt={t('attachedImage', { number: index + 1 })}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.03]" />
        </button>
      ))}
      {isUploading && <span role="status" aria-label={t('sending')}
        className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/55 text-white backdrop-blur-sm">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
      </span>}
    </div>
    {selected && <dialog ref={dialogRef} aria-label={t('imagePreview')} onCancel={() => setSelected(null)}
      onClick={() => setSelected(null)}
      className="fixed inset-0 z-[1200] m-0 flex h-dvh max-h-none w-screen max-w-none items-center justify-center border-0 bg-black/80 p-6">
      <button type="button" autoFocus onClick={() => setSelected(null)} aria-label={t('closeImage')}
        className="absolute right-5 top-4 rounded-full bg-slate-800 px-3 py-1 text-2xl text-white">×</button>
      <div onClick={event => event.stopPropagation()}>
        <GalleryPhoto image={selected} alt={t('imagePreview')}
          className="max-h-[90dvh] max-w-full rounded-lg object-contain" />
      </div>
    </dialog>}
  </>
}
