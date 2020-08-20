export const generateRandomInts = (total: number, max: number): number[] => {
    const set = new Set<number>()
    for (; ;) {
        set.add(Math.floor(Math.random() * (max + 1)))
        if (set.size === total) {
            return Array.from(set.values())
        }
    }
}

// export const useGameURL = (): any => {
//     // export const useGameURL = (): GameURL => {
//     // const match = useRouteMatch<any>(`/:slug`);
//     // return {
//     //     slug: match && match.params.slug
//     // };
//     return null as any
// }