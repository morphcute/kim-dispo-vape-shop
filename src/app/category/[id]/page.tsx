'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function CategoryPage() {
  const params = useParams()
  const id = params?.id as string
  const { data, error, isLoading } = useSWR(`/api/storefront/categories/${id}/brands`, fetcher)

  if (isLoading) return <div className="text-gray-400">Loading…</div>
  if (error) return <div className="text-rose-500">Failed to load</div>

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold text-yellow-300">{data.name}</h1>
      {data.posterUrl && (
        <a href={data.posterUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={data.posterUrl}
            className="max-h-72 w-full rounded object-contain"
            alt="poster"
          />
        </a>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.brands.map((b: any) => (
          <Link
            key={b.id}
            href={`/brand/${b.id}`}
            className="rounded-xl border border-yellow-400/30 bg-black/60 p-4 hover:border-yellow-400"
          >
            <h3 className="text-lg font-semibold">{b.name}</h3>
          </Link>
        ))}
      </div>
    </main>
  )
}
