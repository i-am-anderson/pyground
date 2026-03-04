"use server";

export type FileProps = {
  content: string;
  encoding: string;
  node_id: string;
  sha: string;
  size: number;
  url: string;
};

export type ActionResponse = {
  success: boolean;
  data?: FileProps;
  error?: string;
};

type ActionProps = {
  url: string;
};

export async function getRepoFileAction({
  url,
}: ActionProps): Promise<ActionResponse> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "PyGround",
      },
      next: { revalidate: 900 },
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Erro ao buscar arquivo.",
      };
    }

    return { success: true, data: result }; // result já é o objeto FileProps
  } catch (error) {
    return { success: false, error: "Falha na conexão com o servidor." };
  }
}
