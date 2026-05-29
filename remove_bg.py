from PIL import Image
import sys

def remove_dark_bg(image_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        data = img.getdata()
        
        # Find the background color by looking at the top-left pixel
        bg_color = data[0]
        bg_r, bg_g, bg_b = bg_color[:3]
        
        new_data = []
        for item in data:
            r, g, b, a = item
            # Calculate distance from background color
            dist = ((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)**0.5
            
            # If it's very close to the background color, make it transparent
            if dist < 20:
                new_data.append((r, g, b, 0))
            elif dist < 40:
                # Anti-aliasing edge
                alpha = int(((dist - 20) / 20.0) * 255)
                new_data.append((r, g, b, alpha))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(image_path, "PNG")
        print("Successfully removed background!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_dark_bg(r"c:\Users\maiko\OneDrive\Escritorio\Hackaton\client\public\logo.png")
