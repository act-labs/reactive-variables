import styled from "styled-components"

export const Page = styled.div`
    box-sizing: border-box;

    *, *:before, *:after {
        box-sizing: inherit;
    }
`

export const PageContent = styled(Page)`
    display: flex;
    flex-direction: column;
    padding: 20px;
`

export const Row = styled.div`
    display: flex;
`

const margin = 20
export const Controls = styled(Row)`
    & > * {
      margin-left: ${margin}px;
    }
`

export const Card = styled.div<{ selected?: boolean }>`
    display: flex;
    flex-wrap: wrap;
    justify-content: top;
    flex-direction:column;
    overflow: hidden;
    padding: 10px;

    margin: ${margin}px;
    width: 200px;
    font-family: Quicksand, arial, sans-serif;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.05), 0 0px 6px rgba(0, 0, 0, 0.08);
    transition: all .2s ease-in-out;
    border-radius: 5px;
    border-style: solid;
    border-color: ${({ selected, theme: { cards: { selectedBorderColor, borderColor } } }) => selected ? selectedBorderColor : borderColor};
    border-width: ${({ selected, theme: { cards: { selectedBorderWidth, borderWidth } } }) => selected ? selectedBorderWidth : borderWidth}px;
    & > h4 {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
`

export const defaultTheme = {
    cards: {
        selectedBorderColor: "green",
        borderColor: "green",
        selectedBorderWidth: 1,
        borderWidth: 0
    }
}

export const colorTheme = {
    cards: {
        selectedBorderColor: "purple",
        borderColor: "green",
        selectedBorderWidth: 2,
        borderWidth: 1
    }
}

Card.defaultProps = {
    theme: defaultTheme
}
