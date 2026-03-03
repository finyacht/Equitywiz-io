import re

html_path = 'home.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Original grid view footer CSS
old_footer_css = r"""        \.tool-card-footer \{
            display: flex;
            align-items: center;
            font-weight: 600;
            font-size: 0\.95rem;
            color: var\(--card-color, #4a6cf7\);
            margin-top: auto;
            transition: all 0\.2s ease;
        \}"""

new_footer_css = """        .tool-card-footer {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--card-color, #4a6cf7);
            background: rgba(255, 255, 255, 0.4);
            border: 2px solid var(--card-color, #4a6cf7);
            margin-top: auto;
            padding: 8px 18px;
            border-radius: 20px;
            transition: all 0.3s ease;
            align-self: flex-start;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tool-card:hover .tool-card-footer {
            background: var(--card-color, #4a6cf7);
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }
        
        .tool-card:hover .tool-card-footer svg {
            transform: translateX(4px);
            fill: white;
        }"""

content = re.sub(old_footer_css, new_footer_css, content, count=1)

old_list_footer_css = r"""        \.tools-container\.view-mode-list \.tool-card-footer \{
            margin-top: 0;
            flex-shrink: 0;
            font-size: 0\.9rem;
            padding-left: 16px;
            border-left: 1px solid rgba\(226, 232, 240, 0\.6\);
        \}"""

new_list_footer_css = """        .tools-container.view-mode-list .tool-card-footer {
            margin-top: 0;
            align-self: center;
            flex-shrink: 0;
            padding: 10px 24px;
            border-left: none;
        }"""

content = re.sub(old_list_footer_css, new_list_footer_css, content, count=1)

# Replace the svg transition since it might be defined below and we already handled it cleanly or need to update its base
old_svg_css = r"""        \.tool-card-footer svg \{
            margin-left: 6px;
            transition: transform 0\.2s ease;
        \}

        \.tool-card:hover \.tool-card-footer svg \{
            transform: translateX\(4px\);
        \}"""

new_svg_css = """        .tool-card-footer svg {
            margin-left: 8px;
            transition: all 0.3s ease;
        }"""

content = re.sub(old_svg_css, new_svg_css, content, count=1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Button CSS updated.")
