"use client"

import React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork } from "lucide-react"
import Link from "next/link"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  url: string
  language: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  owner: {
    avatar_url: string
    login: string
  }
}

const columns: ColumnDef<Repository>[] = [
  {
    accessorKey: "name",
    header: "Repository",
    cell: ({ row }) => {
      const repo = row.original
      return (
        <Link href={repo.url} target="_blank" className="hover:underline">
          <div className="flex items-center gap-2">
            <img
              src={repo.owner.avatar_url || "/placeholder.svg"}
              alt={repo.owner.login}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-semibold text-sm">{repo.name}</p>
              <p className="text-xs text-muted-foreground">{repo.owner.login}</p>
            </div>
          </div>
        </Link>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground max-w-xs truncate">{row.original.description || "No description"}</p>
    ),
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const lang = row.original.language
      return lang ? (
        <Badge variant="secondary" className="text-xs">
          {lang}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">N/A</span>
      )
    },
  },
  {
    accessorKey: "stargazers_count",
    header: "Stars",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Star className="w-4 h-4 text-yellow-500" />
        {row.original.stargazers_count.toLocaleString()}
      </div>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "forks_count",
    header: "Forks",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <GitFork className="w-4 h-4 text-blue-500" />
        {row.original.forks_count.toLocaleString()}
      </div>
    ),
  },
]

interface RepositoryTableProps {
  repositories: Repository[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

export function RepositoryTable({ repositories, isLoading, onLoadMore, hasMore }: RepositoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data: repositories,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="text-xs">{header.column.getIsSorted() === "desc" ? "↓" : "↑"}</span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-secondary/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && (
        <Button onClick={onLoadMore} disabled={isLoading} className="w-full bg-transparent" variant="outline">
          {isLoading ? "Loading..." : "Load More"}
        </Button>
      )}

      {repositories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No repositories found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}
