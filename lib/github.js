export async function commitFile(filePath, content) {
  //   if (process.env.NODE_ENV === "development") {
  //     console.log("DEV MODE — Skipping GitHub commit");
  //     return;
  //   }

  const base64Content = Buffer.from(content).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Auto blog: ${filePath}`,
        content: base64Content,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}

export async function getExistingFiles(folderPath) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${folderPath}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data
    .filter((item) => item.name.endsWith(".mdx"))
    .map((item) => item.name.replace(".mdx", ""));
}

export async function getFileContent(filePath) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${filePath}`);
  }

  const data = await response.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}
