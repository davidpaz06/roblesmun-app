import { createClient } from "@supabase/supabase-js";
import type { FileObject } from "@supabase/storage-js";

// ✅ CORRECTO - URL base del proyecto (sin .storage)
const supabaseUrl = "https://qogwzwobubeuenmcjeao.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3d6d29idWJldWVubWNqZWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTYyNzUsImV4cCI6MjA3NTA3MjI3NX0.Tj_zOTsWpalc4blA35EdQ6C2Q0qH_GbErN0fpOR3dDM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseStorage {
  static async uploadImage(
    file: File,
    folder: string = "sponsors"
  ): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from("roblesmun-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(`Error uploading image: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("roblesmun-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  }

  static async uploadPDF(file: File): Promise<string> {
    try {
      console.log("🚀 Upload directo - sin folder");
      console.log(
        "📄 File:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      if (!file.type.includes("pdf")) {
        throw new Error("El archivo debe ser un PDF");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("El PDF no debe superar los 10MB");
      }

      console.log("📍 Upload path:", file.name);
      console.log("🔄 Starting upload...");

      const { data, error } = await supabase.storage
        .from("registrations")
        .upload(file.name, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("❌ Error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log("✅ Upload successful:", data);

      const { data: urlData } = supabase.storage
        .from("registrations")
        .getPublicUrl(file.name);

      console.log("🔗 Success:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("💥 Failed:", error);
      throw error;
    }
  }

  static async deleteImage(url: string): Promise<void> {
    try {
      const urlParts = url.split("/storage/v1/object/public/roblesmun-images/");
      if (urlParts.length < 2) {
        throw new Error("Invalid URL format");
      }
      const path = urlParts[1];

      const { error } = await supabase.storage
        .from("roblesmun-images")
        .remove([path]);

      if (error) {
        throw new Error(`Error deleting image: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deleteImage:", error);
    }
  }

  static async deletePDF(url: string): Promise<void> {
    try {
      const urlParts = url.split("/storage/v1/object/public/registrations/");
      if (urlParts.length < 2) {
        throw new Error("Invalid PDF URL format");
      }
      const path = urlParts[1];

      const { error } = await supabase.storage
        .from("registrations")
        .remove([path]);

      if (error) {
        throw new Error(`Error deleting PDF: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deletePDF:", error);
    }
  }

  static async listPDFs(
    folder: string = "registrations"
  ): Promise<FileObject[]> {
    try {
      const { data, error } = await supabase.storage
        .from("registrations")
        .list(folder);

      if (error) {
        throw new Error(`Error listing PDFs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in listPDFs:", error);
      return [];
    }
  }

  static getPublicImageUrl(
    fileName: string,
    bucket: string = "general"
  ): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
  }

  static async listFiles(bucket: string = "general"): Promise<FileObject[]> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list();

      if (error) {
        throw new Error(`Error listing files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in listFiles:", error);
      return [];
    }
  }
}
