"use server";

export type TreeProps = {
  mode: string;
  path: string;
  sha: string;
  type: string;
  url: string;
  size?: number;
};

export type RepoProps = {
  sha?: string;
  tree: TreeProps[];
  url?: string;
  truncated?: boolean;
};

export type ActionResponse = {
  success: boolean;
  data?: RepoProps;
  error?: string;
};

type ActionProps = {
  repo: string;
  branch: string;
};

export async function getRepoTreeAction({
  repo,
  branch = "main",
}: ActionProps): Promise<ActionResponse> {
  const user = process.env.GITHUB_USER || "";

  try {
    const res = await fetch(
      `https://api.github.com/repos/${user}/${repo}/git/trees/${branch}?recursive=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "PyGround",
        },
        next: { revalidate: 900 },
      },
    );

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Erro ao buscar repositório.",
      };
    }

    return { success: true, data: result }; // result já é o objeto RepoProps
  } catch (error) {
    return { success: false, error: "Falha na conexão com o servidor." };
  }
}
