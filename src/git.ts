import * as exec from "@actions/exec";
import * as core from "@actions/core";

export async function searchCode(ref: string, filename: string): Promise<string[]> {
    const option: exec.ExecOptions = { ignoreReturnCode: true };
    let text = "";
    option.listeners = {
        stdout: (data: Buffer) => {
            text += data.toString();
        },
    };

    await exec.exec(`git ls-tree -r --name-only ${ref}`, undefined, option);

    // write line break
    core.info("");

    return text
        .split(/[\r\n]/u)
        .map((x) => x.trim())
        .filter((x) => 0 < x.length)
        .filter((x) => x.includes(filename));
}

export async function showCode(ref: string, path: string): Promise<string> {
    const option: exec.ExecOptions = { ignoreReturnCode: true };
    let text = "";
    option.listeners = {
        stdout: (data: Buffer) => {
            text += data.toString();
        },
    };

    await exec.exec(`git show ${ref}:${path}`, undefined, option);

    // write line break
    core.info("");

    return text;
}
