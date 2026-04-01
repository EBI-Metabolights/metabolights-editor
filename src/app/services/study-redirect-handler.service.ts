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

    // 0. Quick bypass for general management paths (like /guide/info/ or /guide/create)
    // These should not be processed for study-specific redirection.
    if (url.toUpperCase().includes('GUIDE')) {
      return true;
    }

    // 1. Parse the incoming Study URL and extract parameters
    const parsedUrl = this.parseStudyUrl(url);

    // 2. Check authentication status
    const isAuthenticated = await this.keycloak.isLoggedIn();

    // 3. Resolve study metadata
    const studyMetadata = await this.resolveStudyMetadata(parsedUrl);

    // 4. Check if we actually have a target to resolve
    const hasTarget = !!parsedUrl.studyId || !!parsedUrl.obfuscationCode || !!parsedUrl.reviewCode;

    // 5. Check if the Study ID exists
    const studyExists = !!studyMetadata && !!studyMetadata.studyId;

    if (hasTarget && !studyExists) {
      if (!isAuthenticated) {
        this.router.navigate(['/study-not-found'], { queryParams: { actions: 'login,home' } });
      } else {
        this.router.navigate(['/study-not-found'], { queryParams: { actions: 'mystudies,home' } });
      }
      return false;
    }

    // 6. Access Control Logic
    if (parsedUrl.accessMode === 'edit' && studyExists) {
      if (!isAuthenticated) {
        const redirectUri = this.configService.config?.auth?.redirectUri;
        if (redirectUri) {
          await this.keycloak.login({ redirectUri });
        } else {
          await this.keycloak.login();
        }
        return false;
      } else {
        // Owner Edit Permission Check
        const isOwnerEdit = studyMetadata.edit || 
           (studyMetadata.submitterOfStudy && (studyMetadata.studyStatus?.toLowerCase() === 'private' || studyMetadata.studyStatus?.toLowerCase() === 'provisional'));
        
        if (isOwnerEdit) {
          // If already on a guide path, allow it without redirecting to the default overview
          if (url.toUpperCase().includes('GUIDE')) {
            return true;
          }
          const targetUrl = `/study/${studyMetadata.studyId}`;
          if (parsedUrl.originalUrl.split('?')[0] === targetUrl) {
            return true;
          }
          this.router.navigate([targetUrl]);
          return false;
        } else {
          return this.evaluateStudyStatus(studyMetadata, isAuthenticated, parsedUrl.originalUrl);
        }
      }

    } else if (parsedUrl.accessMode === 'view' || parsedUrl.obfuscationCode || parsedUrl.reviewCode) {

      // If user has View Permission (Public study or valid Reviewer Code)
      if (studyMetadata && studyMetadata.view) {
        const targetUrl = `/${studyMetadata.studyId}`;
        // If we are already on the view page (or a sub-tab), allow access
        if (parsedUrl.originalUrl.startsWith(targetUrl) && !parsedUrl.originalUrl.startsWith('/study/')) {
           return true;
        }

        // Handle reviewer links: redirect from /reviewer<code> to /<studyId>?reviewCode=<code>
        if (parsedUrl.obfuscationCode) {
           this.router.navigate([targetUrl], { queryParams: { reviewCode: parsedUrl.obfuscationCode } });
           return false;
        }

        // Handle existing reviewCode query params (if not already caught by startsWith above)
        if (parsedUrl.reviewCode) {
           return true;
        }

        // Otherwise redirect to the view page
        this.router.navigate([targetUrl]);
        return false;
      }

      // If no direct view permission, evaluate status (private/provisional/etc)
      return this.evaluateStudyStatus(studyMetadata, isAuthenticated, parsedUrl.originalUrl);
    }

    return isAuthenticated;
  }


  /**
   * Helper function: Evaluates the study status when the user lacks edit/view permissions,
   * or when accessing in view mode unauthenticated.
   * 
   * @param studyMetadata Resolved study metadata
   * @param isAuthenticated Authentication status of the user
   */
  private evaluateStudyStatus(studyMetadata: StudyPermission | any, isAuthenticated: boolean, originalUrl: string): boolean {
    
    // Derived values mapped from typical metadata fields
    const status = studyMetadata.studyStatus?.toLowerCase();
    const isPublic = status === 'public';
    const isPrivate = status === 'private';
    const isProvisional = status === 'provisional' || status === 'provisional study' || !status;
    const studyId = studyMetadata.studyId || '';
    const isReqId = studyId.toUpperCase().startsWith('REQ');

    const hasFirstPrivateDate = !!studyMetadata.firstPrivateDate && studyMetadata.firstPrivateDate.trim() !== '';
    
    // Domain logic: "If study is not completed (accessioned but incomplete):"
    // We treat it as not completed if status is provisional, empty, or it's a REQ ID that isn't explicitly public/private
    const isNotCompleted = isProvisional || (isReqId && !isPublic && !isPrivate); 

    if (isNotCompleted) {
      const targetPath = '/study-not-completed';
      if (originalUrl.startsWith(targetPath)) return true; // Allow guard on this page

      if (isAuthenticated) {
        this.router.navigate([targetPath], {
          queryParams: { studyIdentifier: studyMetadata.studyId, isOwner: studyMetadata.submitterOfStudy, actions: 'mystudies,home' }
        });
      } else {
        this.router.navigate([targetPath], {
          queryParams: { studyIdentifier: studyMetadata.studyId, isOwner: false, actions: 'login,home' }
        });
      }
      return false; 
    }

    if (isPublic) {
      const targetPath = '/' + studyMetadata.studyId;
      if (originalUrl.startsWith(targetPath) && !originalUrl.startsWith('/study/')) return true;

      this.router.navigate([targetPath]);
      return false; 
    }

    if (isPrivate || hasFirstPrivateDate) {
      const targetPath = '/study-not-public';
      if (originalUrl.startsWith(targetPath)) return true;

      this.router.navigate([targetPath], {
        queryParams: { studyIdentifier: studyMetadata.studyId, isOwner: studyMetadata.submitterOfStudy }
      });
      return false; 
    }

    // Unhandled fallback scenario
    if (!originalUrl.startsWith('/page-not-found')) {
       this.router.navigate(['/page-not-found']);
    }
    return false;
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

    if (cleanedUrl.toLowerCase().startsWith('/reviewer')) {
       parsed.obfuscationCode = cleanedUrl.split('/')[1].split('?')[0].replace(/reviewer/i, '');
       parsed.accessMode = 'view';
    }

    // Determine Access Mode (view/edit) & extract Study ID
    // E.g.: /study/MTBLS123 (Edit) vs /MTBLS123 (View)
    const upperCleanedUrl = cleanedUrl.toUpperCase();
    if (upperCleanedUrl.includes('/STUDY/MTBLS') || upperCleanedUrl.includes('/STUDY/REQ') || upperCleanedUrl.includes('/STUDY/GUIDE/')) {
        parsed.accessMode = 'edit';
        parsed.studyId = this.extractIdFromSegments(cleanedUrl);
    } else if (upperCleanedUrl.includes('/GUIDE/')) {
        parsed.accessMode = 'edit';
        parsed.studyId = this.extractIdFromSegments(cleanedUrl);
    } else {
        const potentialId = this.extractIdFromSegments(cleanedUrl);
        if (potentialId) {
            parsed.studyId = potentialId;
            parsed.accessMode = 'view';
        }
    }

    return parsed;
  }

  /**
   * Sub-helper to extract exactly the 'MTBLSxxx' or 'REQxxx' part of the URL cleanly
   */
  private extractIdFromSegments(url: string): string | null {
      const parts = url.split('/');
      for (const part of parts) {
          const upperPart = part.toUpperCase();
          if (upperPart && (upperPart.startsWith('MTBLS') || upperPart.startsWith('REQ'))) {
              return upperPart.split('?')[0]; // normalizing to uppercase for backend compatibility
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
      if (parsedUrl.obfuscationCode || parsedUrl.reviewCode) {
        // Retrieve permissions using Review or Obfuscation code
        const code = parsedUrl.obfuscationCode || parsedUrl.reviewCode;
        return await this.editorService.getStudyPermissionByObfuscationCode(code!);
      } else if (parsedUrl.studyId) {
        // Retrieve permissions via the specific Study ID
        // Note: this should return null or handle gracefully if the study doesn't exist
        return await this.editorService.getStudyPermissionByStudyId(parsedUrl.studyId);
      }
    } catch (e) {
      console.warn("Error fetching study metadata, treating as non-existent.", e);
      return null;
    }

    return null;
  }
}
