import styled from "styled-components";

export interface TextProps {
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "xxl";
    weight?: "regular" | "medium" | "bold";
    color?: string; // allow overriding color
    align?: "left" | "center" | "right";
}

export const Text = styled.p<TextProps>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme, size = "base" }) => theme.typography.sizes[size] || theme.typography.sizes.base};
  font-weight: ${({ theme, weight = "regular" }) =>
        weight === "bold" ? theme.typography.weightBold :
            weight === "medium" ? theme.typography.weightMedium :
                theme.typography.weightRegular
    };
  color: ${({ theme, color }) => color || theme.colors.text.primary};
  text-align: ${({ align = "left" }) => align};
  line-height: 1.5;
`;
