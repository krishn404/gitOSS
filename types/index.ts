export interface Repository {
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

export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  provider?: string
}

export interface SearchResult {
  repositories: Repository[]
  hasMore: boolean
  total: number
  page: number
}
