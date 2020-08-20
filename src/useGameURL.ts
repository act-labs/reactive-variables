import { useRouteMatch } from "react-router-dom"
export type GameSlugs = "history"
export interface GameURL {
    slug?: GameSlugs
}

// export const useGameURL = (): any => {
export const useGameURL = (): GameURL => {
    const match = useRouteMatch<any>(`/:slug`);
    return {
        slug: match && match.params.slug
    };
    // return null as any
}
