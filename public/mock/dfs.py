obj = [
  {
    'name': "a",
    'children': [
      {
        'name': "b",
        'children': [],
      },
    ],
  },
  {
    'name': "c",
    'children': [
      {
        'name': "d",
        'children': [
          {
            'name': "e",
            'children': [],
          },
          {
            'name': "f",
            'children': [
              {
                'name': "g",
                'children': [
                  {
                    'name': "h",
                    'children': []
                  },
                  {
                    'name': "i",
                    'children': [
                      {
                        'name': "k",
                        'children': []
                      }
                    ]
                  },
                  {
                    'name': "j",
                    'children': []
                  }
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

def mutate(node):
  node["new"] = "0x00"

#    Depth-First Search (DFS) and Visitor Pattern
# ....................................................
def dfs(node, visitor): 
  visitor(node)

  if (node["children"] and len(node["children"]) > 0):
    for child in node["children"]:
      dfs(child, visitor)
# ....................................................

for item in obj:
  dfs(item, mutate)

print(obj)