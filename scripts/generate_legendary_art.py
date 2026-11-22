import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle, Rectangle
import matplotlib.patches as patches
import matplotlib.patheffects as pe
from PIL import Image, ImageFilter, ImageEnhance
import os

def create_legendary_art():
    width, height = 1024, 1024
    dpi = 100
    fig, ax = plt.subplots(figsize=(width / dpi, height / dpi), dpi=dpi)
    fig.patch.set_facecolor('#070814')
    ax.set_facecolor('#070814')
    ax.set_xlim(0, 1000)
    ax.set_ylim(0, 1000)
    ax.axis('off')

    # Cosmic / Celestial Nebula Background
    X, Y = np.meshgrid(np.linspace(0, 1, 500), np.linspace(0, 1, 500))
    radial = np.sqrt((X - 0.5)**2 + (Y - 0.55)**2)
    nebula = np.exp(-radial * 3.5)
    ax.imshow(nebula, cmap='inferno', extent=[0, 1000, 0, 1000], alpha=0.85, origin='lower')

    # Divine Halo / Celestial Rings
    theta = np.linspace(0, 2*np.pi, 200)
    for r in [220, 250, 280, 310]:
        xs = 500 + r * np.cos(theta)
        ys = 620 + r * np.sin(theta)
        ax.plot(xs, ys, color='#FFD700', lw=2.5, alpha=0.5,
                path_effects=[pe.withStroke(linewidth=8, foreground='#FF4500')])

    # Celestial Runes on Halo
    for angle in np.linspace(0, 2*np.pi, 16, endpoint=False):
        rx = 500 + 280 * np.cos(angle)
        ry = 620 + 280 * np.sin(angle)
        ax.plot(rx, ry, marker='*', markersize=14, color='#FFF8DC',
                path_effects=[pe.withStroke(linewidth=6, foreground='#FF8C00')])

    # Divine Fiery Wings (Left & Right)
    wing_feathers = [
        # (ctrl_x, ctrl_y, end_x, end_y)
        (350, 680, 120, 850),
        (320, 640, 80, 780),
        (300, 600, 60, 690),
        (310, 560, 100, 590),
        (340, 520, 160, 500),
        (370, 480, 220, 430),
    ]
    for (cx, cy, ex, ey) in wing_feathers:
        # Left Wing Feather
        verts_left = [(500, 600), (cx, cy), (ex, ey), (cx + 30, cy - 40)]
        poly_left = Polygon(verts_left, closed=True, color='#FF4500', alpha=0.7,
                            path_effects=[pe.withStroke(linewidth=6, foreground='#FFD700')])
        ax.add_patch(poly_left)
        # Inner glow feather
        verts_left_in = [(500, 600), (cx * 0.9 + 50, cy * 0.9 + 60), (ex * 0.9 + 50, ey * 0.9 + 60), (cx + 20, cy - 20)]
        poly_left_in = Polygon(verts_left_in, closed=True, color='#FFD700', alpha=0.85)
        ax.add_patch(poly_left_in)

        # Right Wing Feather (Mirrored)
        cx_m, ex_m = 1000 - cx, 1000 - ex
        verts_right = [(500, 600), (cx_m, cy), (ex_m, ey), (cx_m - 30, cy - 40)]
        poly_right = Polygon(verts_right, closed=True, color='#FF4500', alpha=0.7,
                             path_effects=[pe.withStroke(linewidth=6, foreground='#FFD700')])
        ax.add_patch(poly_right)
        verts_right_in = [(500, 600), (1000 - (cx * 0.9 + 50), cy * 0.9 + 60), (1000 - (ex * 0.9 + 50), ey * 0.9 + 60), (cx_m - 20, cy - 20)]
        poly_right_in = Polygon(verts_right_in, closed=True, color='#FFD700', alpha=0.85)
        ax.add_patch(poly_right_in)

    # Majestic Golden Warrior Silhouette & Armor
    # Cape / Aura Flame
    cape_verts = [(440, 580), (560, 580), (620, 280), (500, 220), (380, 280)]
    ax.add_patch(Polygon(cape_verts, closed=True, color='#8B0000', alpha=0.9,
                         path_effects=[pe.withStroke(linewidth=4, foreground='#FF8C00')]))

    # Golden Torso Armor
    torso_verts = [(450, 580), (550, 580), (535, 420), (500, 390), (465, 420)]
    ax.add_patch(Polygon(torso_verts, closed=True, color='#DAA520',
                         path_effects=[pe.withStroke(linewidth=4, foreground='#FFF8DC')]))

    # Chestplate Gem (Cyan VRF Core)
    core = Circle((500, 510), 22, color='#00FFFF',
                  path_effects=[pe.withStroke(linewidth=8, foreground='#008080')])
    ax.add_patch(core)
    ax.plot(500, 510, marker='+', markersize=18, color='#FFFFFF', mew=3)

    # Shoulders Pauldrons
    paul_l = [(455, 595), (410, 615), (380, 560), (430, 540)]
    ax.add_patch(Polygon(paul_l, closed=True, color='#FFD700',
                         path_effects=[pe.withStroke(linewidth=3, foreground='#FF8C00')]))
    paul_r = [(545, 595), (590, 615), (620, 560), (570, 540)]
    ax.add_patch(Polygon(paul_r, closed=True, color='#FFD700',
                         path_effects=[pe.withStroke(linewidth=3, foreground='#FF8C00')]))

    # Golden Helmet / Crown
    helmet = [(470, 610), (530, 610), (540, 680), (500, 720), (460, 680)]
    ax.add_patch(Polygon(helmet, closed=True, color='#FFD700',
                         path_effects=[pe.withStroke(linewidth=3, foreground='#B8860B')]))
    # Crown spikes
    ax.plot([470, 480, 500, 520, 530], [680, 750, 770, 750, 680], color='#FFE4B5', lw=5,
            path_effects=[pe.withStroke(linewidth=4, foreground='#FF8C00')])

    # Blazing Divine Flame Sword (Held diagonally)
    sword_hilt = [(530, 480), (560, 510)]
    ax.plot([530, 560], [480, 510], color='#4B3621', lw=10)
    # Crossguard
    ax.plot([520, 565], [515, 475], color='#FFD700', lw=8,
            path_effects=[pe.withStroke(linewidth=4, foreground='#FF8C00')])
    # Flaming Blade
    blade_x = [545, 780]
    blade_y = [495, 760]
    ax.plot(blade_x, blade_y, color='#FFFFFF', lw=8,
            path_effects=[
                pe.withStroke(linewidth=22, foreground='#FF4500'),
                pe.withStroke(linewidth=14, foreground='#FFD700'),
                pe.withStroke(linewidth=8, foreground='#FFFACD')
            ])

    # Sparks / Embers floating
    np.random.seed(42)
    spark_x = np.random.uniform(100, 900, 120)
    spark_y = np.random.uniform(200, 950, 120)
    spark_s = np.random.uniform(10, 80, 120)
    ax.scatter(spark_x, spark_y, s=spark_s, color='#FFD700', alpha=0.8,
               edgecolors='#FF4500', linewidths=1.5)

    # Bottom Ornate Name Banner
    banner = patches.FancyBboxPatch((150, 60), 700, 90, boxstyle="round,pad=10",
                                     ec="#FFD700", fc="#1A1528", lw=3)
    ax.add_patch(banner)
    ax.text(500, 115, "LEGENDARY CHAMPION", ha='center', va='center',
            fontsize=22, fontweight='bold', color='#FFD700',
            path_effects=[pe.withStroke(linewidth=4, foreground='#8B0000')])
    ax.text(500, 80, "★ ★ ★  LEVEL 3 - PEAK POWER  ★ ★ ★", ha='center', va='center',
            fontsize=12, fontweight='bold', color='#00FFFF',
            path_effects=[pe.withStroke(linewidth=2, foreground='#000080')])

    # Save
    out_dir1 = r"c:\Users\Dell\Documents\Blockchain\project\metadata\images"
    out_dir2 = r"c:\Users\Dell\Documents\Blockchain\project\frontend\public\images"
    path1 = os.path.join(out_dir1, "level_3_legendary.jpg")
    path2 = os.path.join(out_dir2, "level_3_legendary.jpg")

    plt.tight_layout(pad=0)
    plt.savefig(path1, dpi=dpi, facecolor='#070814', bbox_inches='tight')
    plt.savefig(path2, dpi=dpi, facecolor='#070814', bbox_inches='tight')
    plt.close()
    print("Created Level 3 Legendary images at:", path1, "and", path2)

if __name__ == '__main__':
    create_legendary_art()
