// Auto-generated: JSONs do bunny embedded como JS data. Permite ao
// bunny_renderer.js carregar sem fetch() (útil em file:// e como
// safety net contra cache/CORS issues em produção).
window.BUNNY_JSON_DATA = window.BUNNY_JSON_DATA || {};

window.BUNNY_JSON_DATA['assets/bunny/bunny.json'] =
{
  "character": "bunny",
  "frame_size": [
    256,
    256
  ],
  "fps": 30,
  "states": {
    "idle": {
      "character": "bunny",
      "state": "idle",
      "frames": 8,
      "fps": 10,
      "frame_width": 256,
      "frame_height": 256,
      "cols": 8,
      "rows": 1,
      "sheet_width": 2048,
      "sheet_height": 256,
      "loop": true,
      "method": "sprite-sheet-v2",
      "weapon_baked_in": true,
      "weapon": null,
      "hand_anchor_norm_in_bunny_bbox": [
        0.85,
        0.62
      ],
      "files": {
        "spritesheet": "bunny_idle_spritesheet.png"
      }
    },
    "walk": {
      "character": "bunny",
      "state": "walk",
      "frames": 30,
      "fps": 30,
      "frame_width": 320,
      "frame_height": 320,
      "cols": 8,
      "rows": 5,
      "sheet_width": 2560,
      "sheet_height": 1600,
      "loop": true,
      "method": "procedural-v1-bunny+weapon",
      "weapon_baked_in": false,
      "weapon": null,
      "hand_anchor_norm_in_bunny_bbox": [
        0.85,
        0.62
      ],
      "files": {
        "spritesheet": "bunny_walk_side.png",
        "webp": "bunny_walk_side.webp"
      }
    },
    "melee": {
      "character": "bunny",
      "state": "melee",
      "frames": 8,
      "fps": 30,
      "frame_width": 256,
      "frame_height": 256,
      "cols": 8,
      "rows": 1,
      "sheet_width": 2048,
      "sheet_height": 256,
      "loop": false,
      "method": "sprite-sheet-v2",
      "weapon_baked_in": true,
      "weapon": null,
      "hand_anchor_norm_in_bunny_bbox": [
        0.85,
        0.62
      ],
      "files": {
        "spritesheet": "bunny_attack_spritesheet.png"
      }
    },
    "ranged": {
      "character": "bunny",
      "state": "ranged",
      "frames": 18,
      "fps": 30,
      "frame_width": 256,
      "frame_height": 256,
      "cols": 6,
      "rows": 3,
      "sheet_width": 1536,
      "sheet_height": 768,
      "loop": false,
      "method": "procedural-v1-bunny+weapon",
      "weapon_baked_in": false,
      "weapon": null,
      "hand_anchor_norm_in_bunny_bbox": [
        0.85,
        0.62
      ],
      "files": {
        "spritesheet": "bunny_ranged.png",
        "webp": "bunny_ranged.webp"
      }
    },
    "death": {
      "character": "bunny",
      "state": "death",
      "frames": 15,
      "fps": 30,
      "frame_width": 256,
      "frame_height": 256,
      "cols": 6,
      "rows": 3,
      "sheet_width": 1536,
      "sheet_height": 768,
      "loop": false,
      "method": "procedural-v1-bunny+weapon",
      "weapon_baked_in": false,
      "weapon": null,
      "hand_anchor_norm_in_bunny_bbox": [
        0.85,
        0.62
      ],
      "files": {
        "spritesheet": "bunny_death.png",
        "webp": "bunny_death.webp"
      },
      "ends_at_full_transparency": true
    }
  },
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "default_weapon": "sword_placeholder",
  "method": "procedural-v1-bunny+weapon"
};

window.BUNNY_JSON_DATA['assets/bunny/bunny_idle.json'] =
{
  "character": "bunny",
  "state": "idle",
  "frames": 8,
  "fps": 10,
  "frame_width": 256,
  "frame_height": 256,
  "cols": 8,
  "rows": 1,
  "sheet_width": 2048,
  "sheet_height": 256,
  "loop": true,
  "method": "sprite-sheet-v2",
  "weapon_baked_in": true,
  "weapon": null,
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "track": [
    {
      "frame": 0,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 1,
      "bunny": {
        "dx": 0,
        "dy": 1.06,
        "rot_deg": 0.71,
        "sx": 1,
        "sy": 0.998,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 2,
      "bunny": {
        "dx": 0,
        "dy": 1.5,
        "rot_deg": 1,
        "sx": 1,
        "sy": 0.992,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 3,
      "bunny": {
        "dx": 0,
        "dy": 1.06,
        "rot_deg": 0.71,
        "sx": 1,
        "sy": 0.998,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 4,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 5,
      "bunny": {
        "dx": 0,
        "dy": -1.06,
        "rot_deg": -0.71,
        "sx": 1,
        "sy": 0.998,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 6,
      "bunny": {
        "dx": 0,
        "dy": -1.5,
        "rot_deg": -1,
        "sx": 1,
        "sy": 0.992,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 7,
      "bunny": {
        "dx": 0,
        "dy": -1.06,
        "rot_deg": -0.71,
        "sx": 1,
        "sy": 0.998,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    }
  ],
  "files": {
    "spritesheet": "bunny_idle_spritesheet.png"
  }
};

window.BUNNY_JSON_DATA['assets/bunny/bunny_walk.json'] =
{
  "character": "bunny",
  "state": "walk",
  "frames": 30,
  "fps": 30,
  "frame_width": 320,
  "frame_height": 320,
  "cols": 8,
  "rows": 5,
  "sheet_width": 2560,
  "sheet_height": 1600,
  "loop": true,
  "method": "procedural-v1-bunny+weapon",
  "weapon_baked_in": false,
  "weapon": null,
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "track": [
    {
      "frame": 0,
      "bunny": {
        "dx": 1.0,
        "dy": -0.0,
        "rot_deg": 3.0,
        "sx": 1.02,
        "sy": 0.97,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.3,
        169.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.0
      }
    },
    {
      "frame": 1,
      "bunny": {
        "dx": 0.91,
        "dy": -1.63,
        "rot_deg": 2.74,
        "sx": 1.018,
        "sy": 0.973,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        168.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.26
      }
    },
    {
      "frame": 2,
      "bunny": {
        "dx": 0.67,
        "dy": -2.97,
        "rot_deg": 2.01,
        "sx": 1.013,
        "sy": 0.98,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        167.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.99
      }
    },
    {
      "frame": 3,
      "bunny": {
        "dx": 0.31,
        "dy": -3.8,
        "rot_deg": 0.93,
        "sx": 1.006,
        "sy": 0.991,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.3,
        167.2
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -14.07
      }
    },
    {
      "frame": 4,
      "bunny": {
        "dx": -0.1,
        "dy": -3.98,
        "rot_deg": -0.31,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.9,
        167.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15.31
      }
    },
    {
      "frame": 5,
      "bunny": {
        "dx": -0.5,
        "dy": -3.46,
        "rot_deg": -1.5,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.4,
        169.1
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -16.5
      }
    },
    {
      "frame": 6,
      "bunny": {
        "dx": -0.81,
        "dy": -2.35,
        "rot_deg": -2.43,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.9,
        170.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.43
      }
    },
    {
      "frame": 7,
      "bunny": {
        "dx": -0.98,
        "dy": -0.83,
        "rot_deg": -2.93,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        166.1,
        172.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.93
      }
    },
    {
      "frame": 8,
      "bunny": {
        "dx": -0.98,
        "dy": -0.83,
        "rot_deg": -2.93,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        166.1,
        172.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.93
      }
    },
    {
      "frame": 9,
      "bunny": {
        "dx": -0.81,
        "dy": -2.35,
        "rot_deg": -2.43,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.9,
        170.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.43
      }
    },
    {
      "frame": 10,
      "bunny": {
        "dx": -0.5,
        "dy": -3.46,
        "rot_deg": -1.5,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.4,
        169.1
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -16.5
      }
    },
    {
      "frame": 11,
      "bunny": {
        "dx": -0.1,
        "dy": -3.98,
        "rot_deg": -0.31,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.9,
        167.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15.31
      }
    },
    {
      "frame": 12,
      "bunny": {
        "dx": 0.31,
        "dy": -3.8,
        "rot_deg": 0.93,
        "sx": 1.006,
        "sy": 0.991,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.3,
        167.2
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -14.07
      }
    },
    {
      "frame": 13,
      "bunny": {
        "dx": 0.67,
        "dy": -2.97,
        "rot_deg": 2.01,
        "sx": 1.013,
        "sy": 0.98,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        167.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.99
      }
    },
    {
      "frame": 14,
      "bunny": {
        "dx": 0.91,
        "dy": -1.63,
        "rot_deg": 2.74,
        "sx": 1.018,
        "sy": 0.973,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        168.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.26
      }
    },
    {
      "frame": 15,
      "bunny": {
        "dx": 1.0,
        "dy": -0.0,
        "rot_deg": 3.0,
        "sx": 1.02,
        "sy": 0.97,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.3,
        169.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.0
      }
    },
    {
      "frame": 16,
      "bunny": {
        "dx": 0.91,
        "dy": -1.63,
        "rot_deg": 2.74,
        "sx": 1.018,
        "sy": 0.973,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        168.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.26
      }
    },
    {
      "frame": 17,
      "bunny": {
        "dx": 0.67,
        "dy": -2.97,
        "rot_deg": 2.01,
        "sx": 1.013,
        "sy": 0.98,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        167.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.99
      }
    },
    {
      "frame": 18,
      "bunny": {
        "dx": 0.31,
        "dy": -3.8,
        "rot_deg": 0.93,
        "sx": 1.006,
        "sy": 0.991,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.3,
        167.2
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -14.07
      }
    },
    {
      "frame": 19,
      "bunny": {
        "dx": -0.1,
        "dy": -3.98,
        "rot_deg": -0.31,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.9,
        167.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15.31
      }
    },
    {
      "frame": 20,
      "bunny": {
        "dx": -0.5,
        "dy": -3.46,
        "rot_deg": -1.5,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.4,
        169.1
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -16.5
      }
    },
    {
      "frame": 21,
      "bunny": {
        "dx": -0.81,
        "dy": -2.35,
        "rot_deg": -2.43,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.9,
        170.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.43
      }
    },
    {
      "frame": 22,
      "bunny": {
        "dx": -0.98,
        "dy": -0.83,
        "rot_deg": -2.93,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        166.1,
        172.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.93
      }
    },
    {
      "frame": 23,
      "bunny": {
        "dx": -0.98,
        "dy": -0.83,
        "rot_deg": -2.93,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        166.1,
        172.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.93
      }
    },
    {
      "frame": 24,
      "bunny": {
        "dx": -0.81,
        "dy": -2.35,
        "rot_deg": -2.43,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.9,
        170.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -17.43
      }
    },
    {
      "frame": 25,
      "bunny": {
        "dx": -0.5,
        "dy": -3.46,
        "rot_deg": -1.5,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.4,
        169.1
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -16.5
      }
    },
    {
      "frame": 26,
      "bunny": {
        "dx": -0.1,
        "dy": -3.98,
        "rot_deg": -0.31,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.9,
        167.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15.31
      }
    },
    {
      "frame": 27,
      "bunny": {
        "dx": 0.31,
        "dy": -3.8,
        "rot_deg": 0.93,
        "sx": 1.006,
        "sy": 0.991,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.3,
        167.2
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -14.07
      }
    },
    {
      "frame": 28,
      "bunny": {
        "dx": 0.67,
        "dy": -2.97,
        "rot_deg": 2.01,
        "sx": 1.013,
        "sy": 0.98,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        167.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.99
      }
    },
    {
      "frame": 29,
      "bunny": {
        "dx": 0.91,
        "dy": -1.63,
        "rot_deg": 2.74,
        "sx": 1.018,
        "sy": 0.973,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        168.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -12.26
      }
    }
  ],
  "files": {
    "spritesheet": "bunny_walk_side.png",
    "webp": "bunny_walk_side.webp"
  }
};

window.BUNNY_JSON_DATA['assets/bunny/bunny_melee.json'] =
{
  "character": "bunny",
  "state": "melee",
  "frames": 8,
  "fps": 30,
  "frame_width": 256,
  "frame_height": 256,
  "cols": 8,
  "rows": 1,
  "sheet_width": 2048,
  "sheet_height": 256,
  "loop": false,
  "method": "sprite-sheet-v2",
  "weapon_baked_in": true,
  "weapon": null,
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "track": [
    {
      "frame": 0,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15,
        "rot_world_deg": -15
      }
    },
    {
      "frame": 1,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 11.033024347053487,
        "rot_world_deg": 11.033024347053487
      }
    },
    {
      "frame": 2,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 31.909888948081786,
        "rot_world_deg": 31.909888948081786
      }
    },
    {
      "frame": 3,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 43.495674730909414,
        "rot_world_deg": 43.495674730909414
      }
    },
    {
      "frame": 4,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 43.495674730909414,
        "rot_world_deg": 43.495674730909414
      }
    },
    {
      "frame": 5,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 31.909888948081793,
        "rot_world_deg": 31.909888948081793
      }
    },
    {
      "frame": 6,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": 11.033024347053495,
        "rot_world_deg": 11.033024347053495
      }
    },
    {
      "frame": 7,
      "bunny": {
        "dx": 0,
        "dy": 0,
        "rot_deg": 0,
        "sx": 1,
        "sy": 1,
        "alpha": 1,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -14.999999999999993,
        "rot_world_deg": -14.999999999999993
      }
    }
  ],
  "files": {
    "spritesheet": "bunny_attack_spritesheet.png"
  }
};

window.BUNNY_JSON_DATA['assets/bunny/bunny_ranged.json'] =
{
  "character": "bunny",
  "state": "ranged",
  "frames": 18,
  "fps": 30,
  "frame_width": 256,
  "frame_height": 256,
  "cols": 6,
  "rows": 3,
  "sheet_width": 1536,
  "sheet_height": 768,
  "loop": false,
  "method": "procedural-v1-bunny+weapon",
  "weapon_baked_in": false,
  "weapon": null,
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "track": [
    {
      "frame": 0,
      "bunny": {
        "dx": -0.0,
        "dy": 0,
        "rot_deg": -0.0,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": -0.0,
        "offset_y": 0,
        "rot_local_deg": 8.0,
        "rot_world_deg": 8.0
      }
    },
    {
      "frame": 1,
      "bunny": {
        "dx": -1.25,
        "dy": 0,
        "rot_deg": -1.66,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.0,
        172.7
      ],
      "weapon": {
        "offset_x": -0.83,
        "offset_y": 0,
        "rot_local_deg": 2.6,
        "rot_world_deg": 0.94
      }
    },
    {
      "frame": 2,
      "bunny": {
        "dx": -2.16,
        "dy": 0,
        "rot_deg": -2.88,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        173.5
      ],
      "weapon": {
        "offset_x": -1.44,
        "offset_y": 0,
        "rot_local_deg": -1.36,
        "rot_world_deg": -4.24
      }
    },
    {
      "frame": 3,
      "bunny": {
        "dx": -2.74,
        "dy": 0,
        "rot_deg": -3.65,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.0,
        174.0
      ],
      "weapon": {
        "offset_x": -1.83,
        "offset_y": 0,
        "rot_local_deg": -3.88,
        "rot_world_deg": -7.53
      }
    },
    {
      "frame": 4,
      "bunny": {
        "dx": -2.99,
        "dy": 0,
        "rot_deg": -3.99,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        162.9,
        174.3
      ],
      "weapon": {
        "offset_x": -1.99,
        "offset_y": 0,
        "rot_local_deg": -4.96,
        "rot_world_deg": -8.94
      }
    },
    {
      "frame": 5,
      "bunny": {
        "dx": -2.74,
        "dy": 0,
        "rot_deg": -3.74,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        173.9
      ],
      "weapon": {
        "offset_x": -1.57,
        "offset_y": -0.15,
        "rot_local_deg": -4.24,
        "rot_world_deg": -7.98
      }
    },
    {
      "frame": 6,
      "bunny": {
        "dx": -1.59,
        "dy": 0,
        "rot_deg": -2.59,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        165.6,
        173.0
      ],
      "weapon": {
        "offset_x": 0.35,
        "offset_y": -0.34,
        "rot_local_deg": -0.88,
        "rot_world_deg": -3.47
      }
    },
    {
      "frame": 7,
      "bunny": {
        "dx": 0.49,
        "dy": 0,
        "rot_deg": -0.51,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        169.5,
        171.4
      ],
      "weapon": {
        "offset_x": 3.82,
        "offset_y": -0.54,
        "rot_local_deg": 5.18,
        "rot_world_deg": 4.67
      }
    },
    {
      "frame": 8,
      "bunny": {
        "dx": 3.49,
        "dy": 0,
        "rot_deg": 2.49,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        175.0,
        169.3
      ],
      "weapon": {
        "offset_x": 8.81,
        "offset_y": -0.74,
        "rot_local_deg": 13.92,
        "rot_world_deg": 16.41
      }
    },
    {
      "frame": 9,
      "bunny": {
        "dx": 7.41,
        "dy": 0,
        "rot_deg": 6.41,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        182.1,
        166.9
      ],
      "weapon": {
        "offset_x": 15.35,
        "offset_y": -0.93,
        "rot_local_deg": 25.36,
        "rot_world_deg": 31.77
      }
    },
    {
      "frame": 10,
      "bunny": {
        "dx": 8.62,
        "dy": 0,
        "rot_deg": 8,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        184.2,
        165.9
      ],
      "weapon": {
        "offset_x": 17.62,
        "offset_y": -1,
        "rot_local_deg": 29.04,
        "rot_world_deg": 37.04
      }
    },
    {
      "frame": 11,
      "bunny": {
        "dx": 8.03,
        "dy": 0,
        "rot_deg": 8,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        183.0,
        165.9
      ],
      "weapon": {
        "offset_x": 17.03,
        "offset_y": -1,
        "rot_local_deg": 27.57,
        "rot_world_deg": 35.57
      }
    },
    {
      "frame": 12,
      "bunny": {
        "dx": 7.44,
        "dy": 0,
        "rot_deg": 8,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        181.9,
        165.9
      ],
      "weapon": {
        "offset_x": 16.44,
        "offset_y": -1,
        "rot_local_deg": 26.1,
        "rot_world_deg": 34.1
      }
    },
    {
      "frame": 13,
      "bunny": {
        "dx": 6.93,
        "dy": 0,
        "rot_deg": 7.92,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        180.8,
        167.0
      ],
      "weapon": {
        "offset_x": 15.84,
        "offset_y": 0,
        "rot_local_deg": 24.83,
        "rot_world_deg": 32.75
      }
    },
    {
      "frame": 14,
      "bunny": {
        "dx": 5.54,
        "dy": 0,
        "rot_deg": 6.33,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        177.7,
        167.8
      ],
      "weapon": {
        "offset_x": 12.66,
        "offset_y": 0,
        "rot_local_deg": 21.45,
        "rot_world_deg": 27.78
      }
    },
    {
      "frame": 15,
      "bunny": {
        "dx": 3.19,
        "dy": 0,
        "rot_deg": 3.65,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        172.2,
        169.4
      ],
      "weapon": {
        "offset_x": 7.29,
        "offset_y": 0,
        "rot_local_deg": 15.75,
        "rot_world_deg": 19.4
      }
    },
    {
      "frame": 16,
      "bunny": {
        "dx": 0.98,
        "dy": 0,
        "rot_deg": 1.12,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        167.1,
        170.9
      ],
      "weapon": {
        "offset_x": 2.24,
        "offset_y": 0,
        "rot_local_deg": 10.38,
        "rot_world_deg": 11.5
      }
    },
    {
      "frame": 17,
      "bunny": {
        "dx": 0.0,
        "dy": 0,
        "rot_deg": 0.0,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.85
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        171.6
      ],
      "weapon": {
        "offset_x": 0.0,
        "offset_y": 0,
        "rot_local_deg": 8.0,
        "rot_world_deg": 8.0
      }
    }
  ],
  "files": {
    "spritesheet": "bunny_ranged.png",
    "webp": "bunny_ranged.webp"
  }
};

window.BUNNY_JSON_DATA['assets/bunny/bunny_death.json'] =
{
  "character": "bunny",
  "state": "death",
  "frames": 15,
  "fps": 30,
  "frame_width": 256,
  "frame_height": 256,
  "cols": 6,
  "rows": 3,
  "sheet_width": 1536,
  "sheet_height": 768,
  "loop": false,
  "method": "procedural-v1-bunny+weapon",
  "weapon_baked_in": false,
  "weapon": null,
  "hand_anchor_norm_in_bunny_bbox": [
    0.85,
    0.62
  ],
  "track": [
    {
      "frame": 0,
      "bunny": {
        "dx": 0,
        "dy": -0.0,
        "rot_deg": -0.0,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        164.8,
        154.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15.0,
        "rot_world_deg": -15.0
      }
    },
    {
      "frame": 1,
      "bunny": {
        "dx": 0,
        "dy": -4.35,
        "rot_deg": -3.63,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        152.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -10.01,
        "rot_world_deg": -13.64
      }
    },
    {
      "frame": 2,
      "bunny": {
        "dx": 0,
        "dy": -5.99,
        "rot_deg": -4.99,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        163.4,
        152.0
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -14.25,
        "rot_world_deg": -19.24
      }
    },
    {
      "frame": 3,
      "bunny": {
        "dx": 0,
        "dy": -5.7,
        "rot_deg": -3.51,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        163.8,
        151.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15.17,
        "rot_world_deg": -18.68
      }
    },
    {
      "frame": 4,
      "bunny": {
        "dx": 0,
        "dy": -4.67,
        "rot_deg": 1.63,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        165.1,
        149.1
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -15.74,
        "rot_world_deg": -14.11
      }
    },
    {
      "frame": 5,
      "bunny": {
        "dx": 0,
        "dy": -2.91,
        "rot_deg": 10.45,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        166.7,
        145.0
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -16.72,
        "rot_world_deg": -6.27
      }
    },
    {
      "frame": 6,
      "bunny": {
        "dx": 0,
        "dy": -0.41,
        "rot_deg": 22.94,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        167.3,
        139.0
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -18.1,
        "rot_world_deg": 4.83
      }
    },
    {
      "frame": 7,
      "bunny": {
        "dx": 0,
        "dy": 2.82,
        "rot_deg": 39.1,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        165.3,
        131.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -19.9,
        "rot_world_deg": 19.2
      }
    },
    {
      "frame": 8,
      "bunny": {
        "dx": 0,
        "dy": 6.79,
        "rot_deg": 58.94,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        159.0,
        123.3
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -22.1,
        "rot_world_deg": 36.83
      }
    },
    {
      "frame": 9,
      "bunny": {
        "dx": 0,
        "dy": 11.49,
        "rot_deg": 82.45,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        146.7,
        117.7
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -24.72,
        "rot_world_deg": 57.73
      }
    },
    {
      "frame": 10,
      "bunny": {
        "dx": 0,
        "dy": 10.05,
        "rot_deg": 85,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        145.1,
        115.5
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -25,
        "rot_world_deg": 60
      }
    },
    {
      "frame": 11,
      "bunny": {
        "dx": 0,
        "dy": 11.41,
        "rot_deg": 85,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 1.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        145.1,
        116.8
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -25,
        "rot_world_deg": 60
      }
    },
    {
      "frame": 12,
      "bunny": {
        "dx": 0,
        "dy": 12,
        "rot_deg": 85,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 0.918,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        145.1,
        117.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -25,
        "rot_world_deg": 60
      }
    },
    {
      "frame": 13,
      "bunny": {
        "dx": 0,
        "dy": 12,
        "rot_deg": 85,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 0.587,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        145.1,
        117.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -25,
        "rot_world_deg": 60
      }
    },
    {
      "frame": 14,
      "bunny": {
        "dx": 0,
        "dy": 12,
        "rot_deg": 85,
        "sx": 1.0,
        "sy": 1.0,
        "alpha": 0.0,
        "pivot_norm": [
          0.5,
          0.55
        ]
      },
      "hand_anchor_canvas": [
        145.1,
        117.4
      ],
      "weapon": {
        "offset_x": 0,
        "offset_y": 0,
        "rot_local_deg": -25,
        "rot_world_deg": 60
      }
    }
  ],
  "files": {
    "spritesheet": "bunny_death.png",
    "webp": "bunny_death.webp"
  },
  "ends_at_full_transparency": true
};

window.BUNNY_JSON_DATA['assets/bunny/weapons/sword_placeholder.json'] =
{
  "name": "sword_placeholder",
  "image": "sword_placeholder.png",
  "width": 96,
  "height": 128,
  "pivot_px": [
    48,
    99
  ],
  "pivot_norm": [
    0.5,
    0.7734375
  ],
  "baseline_rotation_deg": 0,
  "kind": "melee",
  "note": "Pivot is at the grip \u2014 aligns to the bunny's hand anchor."
};
