import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConfigurationService } from '../configuration.service';
import { EditorService } from './editor.service';
import { StudyPermission } from './headers';

// Interfaces for clean separation of concerns
export interface ParsedStudyUrl {
  studyId: string | null;
  accessMode: 'view' | 'edit' | 'unknown';
  obfuscationCode: string | null;
  reviewCode: string | null;
  originalUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudyRedirectHandlerService {

  constructor(
    private router: Router,
    private keycloak: KeycloakService,
    private editorService: EditorService,
    private configService: ConfigurationService
  ) { }

  /**
   * Main entry point to handle the full redirect decision flow.
   * Can be invoked from AuthGuard or any routing listener.
   * 
   * @param url The incoming URL string (from RouterStateSnapshot.url)
   * @returns Resolves to a boolean (true if access is granted seamlessly, false if redirected)
   */
  public async handleRedirectFlow(url: string): Promise<boolean> {
    
    // 1. Parse the incoming Study URL and extract parameters
    const parsedUrl = this.parseStudyUrl(url);

    // 2. Check authentication status: authenticated or not
    const isAuthenticated = await this.keycloak.isLoggedIn();

    // 3. Resolve study metadata using the Study Service
    const studyMetadata = await this.resolveStudyMetadata(parsedUrl);

    // 4. Check if we actually have a target to resolve (Study ID or Codes)
    const hasTarget = !!parsedUrl.studyId || !!parsedUrl.obfuscationCode || !!parsedUrl.reviewCode;

    // 5. Check if the Study ID exists in the database
    const studyExists = !!studyMetadata && !!studyMetadata.studyId;

    if (hasTarget && !studyExists) {
      // If the study was targeted but does NOT exist:
      if (!isAuthenticated) {
        // If unauthenticated -> redirect to study-not-found with actions: Login, MetaboLights Home
        this.router.navigate(['/study-not-found'], { queryParams: { actions: 'login,home' } });
      } else {
        // If authenticated -> redirect to study-not-found with actions: My Studies, MetaboLights Home
        this.router.navigate(['/study-not-found'], { queryParams: { actions: 'mystudies,home' } });
      }
      return false; // Do NOT proceed further
    }

    // 6. If study EXISTS or no specific target was found (like /guide/create), evaluate:
    if (parsedUrl.accessMode === 'edit' && studyExists) {
      // A. Access Mode = EDIT

      if (!isAuthenticated) {
        // If unauthenticated -> redirect to Keycloak with a redirect URL pointing to the Study Edit Path
        // Ensure we include the baseHref for the redirect URI
        const baseHref = this.configService.baseHref || '/';
        const cleanedBaseHref = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
        const redirectUri = window.location.origin + cleanedBaseHref + parsedUrl.originalUrl;
        await this.keycloak.login({ redirectUri });
        return false;
      } else {
        // If authenticated:
        if (studyMetadata.edit) {
          // If user has Edit Permission -> redirect to Study Edit Page URL
          // Avoid infinite loop if we are already on the correct path
          const targetUrl = `/study/${studyMetadata.studyId}`;
          if (parsedUrl.originalUrl.startsWith(targetUrl)) {
            return true;
          }
          this.router.navigate([targetUrl]);
          return false;
        } else {
          // If user does NOT have Edit Permission -> evaluate Study Status
          this.evaluateStudyStatus(studyMetadata, isAuthenticated, parsedUrl.originalUrl);
          return false;
        }
      }

    } else if (parsedUrl.accessMode === 'view') {
      // B. Access Mode = VIEW

      // Check authentication:
      if (isAuthenticated) {
        // If authenticated:
        if (studyMetadata.view) {
          // If user has View Permission -> redirect to Study View Page URL
          const targetUrl = `/${studyMetadata.studyId}`;
          if (parsedUrl.originalUrl.startsWith(targetUrl)) {
             return true;
          }
          this.router.navigate([targetUrl]);
          return false;
        } else {
          // If not, evaluate Study Status
          this.evaluateStudyStatus(studyMetadata, isAuthenticated, parsedUrl.originalUrl);
          return false;
        }
      } else {
        // If unauthenticated: evaluate public/private status and completed/not-completed logic
        this.evaluateStudyStatus(studyMetadata, isAuthenticated, parsedUrl.originalUrl);
        return false;
      }
    }

    // Fallback if the URL could not be parsed into a known study mode or is a general authenticated page
    return isAuthenticated;
  }


  /**
   * Helper function: Evaluates the study status when the user lacks edit/view permissions,
   * or when accessing in view mode unauthenticated.
   * 
   * @param studyMetadata Resolved study metadata
   * @param isAuthenticated Authentication status of the user
   */
  private evaluateStudyStatus(studyMetadata: StudyPermission | any, isAuthenticated: boolean, originalUrl: string): void {
    
    // Derived values mapped from typical metadata fields
    const isPublic = studyMetadata.studyStatus?.toLowerCase() === 'public';
    const isPrivate = studyMetadata.studyStatus?.toLowerCase() === 'private';
    const hasFirstPrivateDate = !!studyMetadata.firstPrivateDate && studyMetadata.firstPrivateDate.trim() !== '';
    
    // Domain logic: "If study is not completed (accessioned but incomplete):"
    const isNotCompleted = hasFirstPrivateDate && studyMetadata.studyStatus?.toLowerCase() === 'provisional'; 

    if (isNotCompleted) {
      const targetPath = '/study-not-completed';
      if (originalUrl.startsWith(targetPath)) return;

      if (isAuthenticated) {
        this.router.navigate([targetPath], {
          queryParams: { studyIdentifier: studyMetadata.studyId, actions: 'mystudies,home' }
        });
      } else {
        this.router.navigate([targetPath], {
          queryParams: { studyIdentifier: studyMetadata.studyId, actions: 'login,home' }
        });
      }
      return; 
    }

    if (isPublic) {
      const targetPath = '/' + studyMetadata.studyId;
      if (originalUrl.startsWith(targetPath)) return;

      // If study is public -> redirect to Study View Page URL
      this.router.navigate([targetPath]);
      return; 
    }

    if (isPrivate || hasFirstPrivateDate) {
      const targetPath = '/study-not-public';
      if (originalUrl.startsWith(targetPath)) return;

      // If study is private or has non-empty first_private_date -> redirect to study-not-public
      this.router.navigate([targetPath], {
        queryParams: { studyIdentifier: studyMetadata.studyId }
      });
      return; 
    }

    // Unhandled fallback scenario (optional)
    if (!originalUrl.startsWith('/page-not-found')) {
       this.router.navigate(['/page-not-found']);
    }
  }


  /**
   * Helper function: Parses the incoming URL and extracts required components.
   * @param url The string URL to parse
   * @returns ParsedStudyUrl object containing studyId, accessMode, obfuscationCode, and reviewCode
   */
  private parseStudyUrl(url: string): ParsedStudyUrl {
    const parsed: ParsedStudyUrl = {
      studyId: null,
      accessMode: 'unknown',
      obfuscationCode: null,
      reviewCode: null,
      originalUrl: url
    };

    // Extract query parameters (e.g. reviewCode)
    if (url.includes('?')) {
      const qs = url.split('?')[1];
      const params = new URLSearchParams(qs);
      parsed.reviewCode = params.get('reviewCode');
    }

    // Extract Obfuscation code from reviewer path
    // We check for startsWith with and without baseHref for resilience
    const baseHref = this.configService.baseHref || '/';
    const cleanedUrl = url.startsWith(baseHref) ? url.substring(baseHref.length - (baseHref.endsWith('/') ? 1 : 0)) : url;

    if (cleanedUrl.startsWith('/reviewer')) {
       parsed.obfuscationCode = cleanedUrl.split('/')[1].split('?')[0].replace('reviewer', '');
       parsed.accessMode = 'view';
    }

    // Determine Access Mode (view/edit) & extract Study ID
    // E.g.: /study/MTBLS123 (Edit) vs /MTBLS123 (View)
    if (cleanedUrl.startsWith('/study/MTBLS') || cleanedUrl.startsWith('/study/REQ') || cleanedUrl.startsWith('/study/guide/')) {
        parsed.accessMode = 'edit';
        parsed.studyId = this.extractIdFromSegments(cleanedUrl);
    } else if (cleanedUrl.startsWith('/guide/')) {
        parsed.accessMode = 'edit';
        parsed.studyId = this.extractIdFromSegments(cleanedUrl);
    } else if (cleanedUrl.startsWith('/MTBLS') || cleanedUrl.startsWith('/REQ')) {
        parsed.accessMode = 'view';
        parsed.studyId = this.extractIdFromSegments(cleanedUrl);
    }

    return parsed;
  }

  /**
   * Sub-helper to extract exactly the 'MTBLSxxx' or 'REQxxx' part of the URL cleanly
   */
  private extractIdFromSegments(url: string): string | null {
      const parts = url.split('/');
      for (const part of parts) {
          if (part && (part.startsWith('MTBLS') || part.startsWith('REQ'))) {
              return part.split('?')[0]; // strip query string if appended
          }
      }
      return null;
  }


  /**
   * Helper function: Resolves study metadata using the Study Service
   * @param parsedUrl Extracted elements used to retrieve permissions
   */
  private async resolveStudyMetadata(parsedUrl: ParsedStudyUrl): Promise<StudyPermission | null> {
    try {
      if (parsedUrl.studyId) {
        // Retrieve permissions via the specific Study ID
        // Note: this should return null or handle gracefully if the study doesn't exist
        return await this.editorService.getStudyPermissionByStudyId(parsedUrl.studyId);
      } else if (parsedUrl.obfuscationCode || parsedUrl.reviewCode) {
        // Retrieve permissions using Review or Obfuscation code
        const code = parsedUrl.obfuscationCode || parsedUrl.reviewCode;
        return await this.editorService.getStudyPermissionByObfuscationCode(code!);
      }
    } catch (e) {
      console.warn("Error fetching study metadata, treating as non-existent.", e);
      return null;
    }

    return null;
  }
}
