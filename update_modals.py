import os
import re

base_dir = r"e:\Downloads\antigravity\portfolio-site"
assets_dir = os.path.join(base_dir, "assets", "videos")

def get_sorted_videos(rel_folder):
    folder_path = os.path.join(assets_dir, rel_folder)
    files = [f for f in os.listdir(folder_path) if f.endswith('.mp4')]
    # Sort by creation time descending (newest first)
    files.sort(key=lambda x: os.path.getctime(os.path.join(folder_path, x)), reverse=True)
    # Return relative paths for HTML
    return [f"assets/videos/{rel_folder}/{f}" for f in files]

mornze_videos = get_sorted_videos("mornze")
ig_trends_videos = get_sorted_videos("instagram-trends")
jewelry_videos = get_sorted_videos("jewelry/sub-1")
love_story_videos = get_sorted_videos("love-story")
saree_videos = get_sorted_videos("saree/sub-1")
sneaker_videos = get_sorted_videos("sneaker")
trailer_videos = get_sorted_videos("Trailor")

html_file = os.path.join(base_dir, "index.html")
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

def replace_modal_videos(modal_id, video_paths):
    global html
    pattern = r'(<div class="glass-modal" id="' + modal_id + r'">.*?<div class="swiper-wrapper">)(.*?)(</div>\s*<div class="swiper-button-next fs-nav">)'
    slides = ''
    for path in video_paths:
        path_html = path.replace("'", "&#39;")
        slides += f'\n                    <div class="swiper-slide"><video loop playsinline><source src="{path_html}" type="video/mp4"></video><div class="modal-controls"><button class="control-btn play-pause-btn"><i data-lucide="play"></i></button><button class="control-btn fullscreen-btn"><i data-lucide="maximize"></i></button></div></div>'
    slides += '\n                '
    html = re.sub(pattern, r'\g<1>' + slides + r'\g<3>', html, flags=re.DOTALL)

replace_modal_videos("modal-mornze", mornze_videos)
replace_modal_videos("modal-ig-trends", ig_trends_videos)
replace_modal_videos("modal-jewelry", jewelry_videos)
replace_modal_videos("modal-love-story", love_story_videos)
replace_modal_videos("modal-saree", saree_videos)
replace_modal_videos("modal-sneaker", sneaker_videos)

# Check if trailer modal exists, if not, append it before TRUE FULLSCREEN PLAYER OVERLAY
trailer_modal_str = f'''
    <!-- Modal: Trailer ({len(trailer_videos)} Videos) -->
    <div class="glass-modal" id="modal-trailer">
        <div class="modal-header"><h2>Trailer</h2><button class="close-modal-btn"><i data-lucide="x"></i></button></div>
        <div class="modal-body">
            <div class="swiper modalSwiper">
                <div class="swiper-wrapper">'''
for path in trailer_videos:
    path_html = path.replace("'", "&#39;")
    trailer_modal_str += f'\n                    <div class="swiper-slide"><video loop playsinline><source src="{path_html}" type="video/mp4"></video><div class="modal-controls"><button class="control-btn play-pause-btn"><i data-lucide="play"></i></button><button class="control-btn fullscreen-btn"><i data-lucide="maximize"></i></button></div></div>'
trailer_modal_str += '''
                </div>
                <div class="swiper-button-next fs-nav"></div><div class="swiper-button-prev fs-nav"></div>
            </div>
        </div>
    </div>
'''

if 'id="modal-trailer"' not in html:
    html = html.replace('<!-- TRUE FULLSCREEN PLAYER OVERLAY -->', trailer_modal_str + '\n    <!-- TRUE FULLSCREEN PLAYER OVERLAY -->')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated successfully")
