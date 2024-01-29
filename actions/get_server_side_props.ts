import fs from "fs/promises";
import path from "path";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
    const props = { dirs: [] };
    try {
      const dirs = await fs.readdir(path.join(process.cwd(), "/public/images"));
      props.dirs = dirs as any;
      return { props };
    } catch (error) {
      return { props };
    }
  };